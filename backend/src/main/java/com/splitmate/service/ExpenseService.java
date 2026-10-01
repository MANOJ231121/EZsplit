package com.splitmate.service;

import com.splitmate.dto.CreateExpenseRequest;
import com.splitmate.dto.ExpenseDto;
import com.splitmate.dto.UserDto;
import com.splitmate.exception.BadRequestException;
import com.splitmate.exception.ResourceNotFoundException;
import com.splitmate.exception.UnauthorizedException;
import com.splitmate.model.*;
import com.splitmate.model.enums.ActivityType;
import com.splitmate.model.enums.SplitType;
import com.splitmate.repository.ExpenseRepository;
import com.splitmate.repository.GroupRepository;
import com.splitmate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityService activityService;

    public ExpenseDto createExpense(String currentUserId, CreateExpenseRequest req) {
        if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Expense amount must be greater than zero");
        }

        String paidByUserId = req.getPaidBy() != null ? req.getPaidBy() : currentUserId;
        User paidByUser = userRepository.findById(paidByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Payer user not found"));

        Group group = null;
        if (req.getGroupId() != null && !req.getGroupId().isBlank()) {
            group = groupRepository.findById(req.getGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + req.getGroupId()));
            if (!group.getMemberIds().contains(currentUserId)) {
                throw new UnauthorizedException("You are not a member of this group");
            }
        }

        List<ExpenseSplit> participants = processAndValidateSplits(req.getAmount(), req.getSplitType(), req.getParticipants(), paidByUserId);

        Expense expense = new Expense();
        expense.setGroupId(req.getGroupId());
        expense.setDescription(req.getDescription());
        expense.setAmount(req.getAmount().setScale(2, RoundingMode.HALF_UP));
        expense.setPaidBy(paidByUserId);
        expense.setSplitType(req.getSplitType() != null ? req.getSplitType() : SplitType.EQUAL);
        expense.setParticipants(participants);
        expense.setCategory(req.getCategory() != null ? req.getCategory() : "General");
        expense.setCreatedBy(currentUserId);
        expense.setDate(Instant.now());
        expense.setCreatedAt(Instant.now());

        Expense saved = expenseRepository.save(expense);

        // Collect all involved user IDs for activity logging
        Set<String> involvedUsers = new HashSet<>();
        involvedUsers.add(paidByUserId);
        involvedUsers.add(currentUserId);
        for (ExpenseSplit p : participants) {
            involvedUsers.add(p.getUserId());
        }

        activityService.logActivity(
                new ArrayList<>(involvedUsers),
                currentUserId,
                ActivityType.EXPENSE_ADDED,
                "Expense Added",
                paidByUser.getName() + " added expense '" + saved.getDescription() + "' (₹" + saved.getAmount() + ")",
                saved.getId()
        );

        return convertToDto(saved);
    }

    public List<ExpenseSplit> processAndValidateSplits(BigDecimal totalAmount, SplitType splitType, List<ExpenseSplit> rawParticipants, String paidByUserId) {
        if (rawParticipants == null || rawParticipants.isEmpty()) {
            throw new BadRequestException("At least one participant must be selected for expense splitting");
        }

        int count = rawParticipants.size();
        List<ExpenseSplit> validated = new ArrayList<>();

        if (splitType == null || splitType == SplitType.EQUAL) {
            BigDecimal equalShare = totalAmount.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
            BigDecimal remainder = totalAmount.subtract(equalShare.multiply(BigDecimal.valueOf(count)));

            for (int i = 0; i < count; i++) {
                ExpenseSplit item = rawParticipants.get(i);
                BigDecimal share = equalShare;
                // Add remainder cents to first participant (often payer) to ensure exact total match
                if (i == 0) {
                    share = share.add(remainder);
                }
                validated.add(new ExpenseSplit(item.getUserId(), share, 100.0 / count));
            }
        } else if (splitType == SplitType.EXACT) {
            BigDecimal sum = BigDecimal.ZERO;
            for (ExpenseSplit item : rawParticipants) {
                if (item.getAmount() == null || item.getAmount().compareTo(BigDecimal.ZERO) < 0) {
                    throw new BadRequestException("Invalid custom split amount for participant");
                }
                sum = sum.add(item.getAmount());
                validated.add(new ExpenseSplit(item.getUserId(), item.getAmount().setScale(2, RoundingMode.HALF_UP), null));
            }

            if (sum.setScale(2, RoundingMode.HALF_UP).compareTo(totalAmount.setScale(2, RoundingMode.HALF_UP)) != 0) {
                throw new BadRequestException("The sum of custom splits (₹" + sum + ") must equal the total expense amount (₹" + totalAmount + ")");
            }
        } else if (splitType == SplitType.PERCENTAGE) {
            double percentSum = 0.0;
            for (ExpenseSplit item : rawParticipants) {
                double pct = item.getPercentage() != null ? item.getPercentage() : 0.0;
                percentSum += pct;
                BigDecimal share = totalAmount.multiply(BigDecimal.valueOf(pct)).divide(BigDecimal.valueOf(100.0), 2, RoundingMode.HALF_UP);
                validated.add(new ExpenseSplit(item.getUserId(), share, pct));
            }

            if (Math.abs(percentSum - 100.0) > 0.01) {
                throw new BadRequestException("The split percentages (" + String.format("%.1f", percentSum) + "%) must sum to 100%");
            }
        }

        return validated;
    }

    public List<ExpenseDto> getGroupExpenses(String currentUserId, String groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if (!group.getMemberIds().contains(currentUserId)) {
            throw new UnauthorizedException("You are not a member of this group");
        }

        List<Expense> expenses = expenseRepository.findByGroupIdOrderByDateDesc(groupId);
        return expenses.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<ExpenseDto> getRecentExpenses(String currentUserId) {
        List<Expense> expenses = expenseRepository.findByPaidByOrParticipantsUserIdOrderByDateDesc(currentUserId, currentUserId);
        return expenses.stream().limit(20).map(this::convertToDto).collect(Collectors.toList());
    }

    public ExpenseDto getExpenseById(String currentUserId, String expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        return convertToDto(expense);
    }

    public ExpenseDto updateExpense(String currentUserId, String expenseId, CreateExpenseRequest req) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getCreatedBy().equals(currentUserId) && !expense.getPaidBy().equals(currentUserId)) {
            throw new UnauthorizedException("Only the expense creator or payer can edit this expense");
        }

        List<ExpenseSplit> participants = processAndValidateSplits(req.getAmount(), req.getSplitType(), req.getParticipants(), req.getPaidBy());

        expense.setDescription(req.getDescription());
        expense.setAmount(req.getAmount().setScale(2, RoundingMode.HALF_UP));
        expense.setPaidBy(req.getPaidBy());
        expense.setSplitType(req.getSplitType());
        expense.setParticipants(participants);
        if (req.getCategory() != null) expense.setCategory(req.getCategory());

        Expense updated = expenseRepository.save(expense);
        return convertToDto(updated);
    }

    public void deleteExpense(String currentUserId, String expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getCreatedBy().equals(currentUserId) && !expense.getPaidBy().equals(currentUserId)) {
            throw new UnauthorizedException("Only the expense creator or payer can delete this expense");
        }

        expenseRepository.delete(expense);
    }

    public ExpenseDto convertToDto(Expense exp) {
        ExpenseDto dto = new ExpenseDto();
        dto.setId(exp.getId());
        dto.setGroupId(exp.getGroupId());
        if (exp.getGroupId() != null) {
            groupRepository.findById(exp.getGroupId()).ifPresent(g -> dto.setGroupName(g.getName()));
        }
        dto.setDescription(exp.getDescription());
        dto.setAmount(exp.getAmount());

        userRepository.findById(exp.getPaidBy()).ifPresent(u -> dto.setPaidBy(new UserDto(u)));
        userRepository.findById(exp.getCreatedBy()).ifPresent(u -> dto.setCreatedBy(new UserDto(u)));

        dto.setSplitType(exp.getSplitType());
        dto.setCategory(exp.getCategory());
        dto.setDate(exp.getDate());
        dto.setCreatedAt(exp.getCreatedAt());

        List<ExpenseDto.ExpenseSplitDto> splitDtos = new ArrayList<>();
        if (exp.getParticipants() != null) {
            for (ExpenseSplit split : exp.getParticipants()) {
                User participantUser = userRepository.findById(split.getUserId()).orElse(null);
                if (participantUser != null) {
                    splitDtos.add(new ExpenseDto.ExpenseSplitDto(new UserDto(participantUser), split.getAmount(), split.getPercentage()));
                }
            }
        }
        dto.setParticipants(splitDtos);

        return dto;
    }
}
