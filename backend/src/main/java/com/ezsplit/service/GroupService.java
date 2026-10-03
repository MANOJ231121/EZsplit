package com.ezsplit.service;

import com.ezsplit.dto.CreateGroupRequest;
import com.ezsplit.dto.GroupDto;
import com.ezsplit.dto.UserDto;
import com.ezsplit.exception.BadRequestException;
import com.ezsplit.exception.ResourceNotFoundException;
import com.ezsplit.exception.UnauthorizedException;
import com.ezsplit.model.*;
import com.ezsplit.model.enums.ActivityType;
import com.ezsplit.repository.ExpenseRepository;
import com.ezsplit.repository.GroupRepository;
import com.ezsplit.repository.SettlementRepository;
import com.ezsplit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private ActivityService activityService;

    public GroupDto createGroup(String currentUserId, CreateGroupRequest req) {
        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<String> memberIds = new ArrayList<>();
        memberIds.add(currentUserId);

        if (req.getMemberIds() != null) {
            for (String memberId : req.getMemberIds()) {
                if (!memberIds.contains(memberId) && userRepository.existsById(memberId)) {
                    memberIds.add(memberId);
                }
            }
        }

        String category = req.getCategory() != null ? req.getCategory() : "Trip";
        Group group = new Group(req.getName(), req.getDescription(), category, currentUserId, memberIds);
        Group saved = groupRepository.save(group);

        activityService.logActivity(
                memberIds,
                currentUserId,
                ActivityType.GROUP_CREATED,
                "Group Created",
                creator.getName() + " created group '" + saved.getName() + "'",
                saved.getId()
        );

        return convertToDto(saved, currentUserId);
    }

    public List<GroupDto> getUserGroups(String currentUserId) {
        List<Group> groups = groupRepository.findByMemberIdsContaining(currentUserId);
        return groups.stream()
                .map(g -> convertToDto(g, currentUserId))
                .collect(Collectors.toList());
    }

    public GroupDto getGroupById(String currentUserId, String groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + groupId));

        if (!group.getMemberIds().contains(currentUserId)) {
            throw new UnauthorizedException("You are not a member of this group");
        }

        return convertToDto(group, currentUserId);
    }

    public GroupDto addMemberToGroup(String currentUserId, String groupId, String newMemberUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if (!group.getMemberIds().contains(currentUserId)) {
            throw new UnauthorizedException("You are not authorized to modify this group");
        }

        User newMember = userRepository.findById(newMemberUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member user not found"));

        if (!group.getMemberIds().contains(newMemberUserId)) {
            group.getMemberIds().add(newMemberUserId);
            groupRepository.save(group);

            activityService.logActivity(
                    group.getMemberIds(),
                    currentUserId,
                    ActivityType.GROUP_MEMBER_ADDED,
                    "Member Added",
                    newMember.getName() + " was added to group '" + group.getName() + "'",
                    group.getId()
            );
        }

        return convertToDto(group, currentUserId);
    }

    public void removeMemberFromGroup(String currentUserId, String groupId, String targetUserId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if (!group.getMemberIds().contains(currentUserId)) {
            throw new UnauthorizedException("You are not authorized to modify this group");
        }

        if (group.getCreatedBy().equals(targetUserId) && !currentUserId.equals(targetUserId)) {
            throw new BadRequestException("Group creator cannot be removed by another member");
        }

        group.getMemberIds().remove(targetUserId);
        groupRepository.save(group);
    }

    public GroupDto convertToDto(Group group, String currentUserId) {
        List<User> memberUsers = userRepository.findByIdIn(group.getMemberIds());
        List<UserDto> memberDtos = memberUsers.stream().map(UserDto::new).collect(Collectors.toList());

        List<Expense> groupExpenses = expenseRepository.findByGroupIdOrderByDateDesc(group.getId());
        List<Settlement> groupSettlements = SettlementService.confirmedOnly(
                settlementRepository.findByGroupId(group.getId()));

        BigDecimal totalExpenses = groupExpenses.stream()
                .map(Expense::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate my net balance in this group
        BigDecimal myBalance = BigDecimal.ZERO;
        for (Expense exp : groupExpenses) {
            String paidBy = exp.getPaidBy();
            if (paidBy.equals(currentUserId)) {
                // I paid for this expense. Sum shares of other participants.
                for (ExpenseSplit split : exp.getParticipants()) {
                    if (!split.getUserId().equals(currentUserId)) {
                        myBalance = myBalance.add(split.getAmount());
                    }
                }
            } else {
                // Someone else paid. Find my share.
                for (ExpenseSplit split : exp.getParticipants()) {
                    if (split.getUserId().equals(currentUserId)) {
                        myBalance = myBalance.subtract(split.getAmount());
                    }
                }
            }
        }

        for (Settlement s : groupSettlements) {
            if (s.getFromUserId().equals(currentUserId)) {
                // I paid settlement -> my balance increases towards 0
                myBalance = myBalance.add(s.getAmount());
            } else if (s.getToUserId().equals(currentUserId)) {
                // I received settlement -> my balance decreases towards 0
                myBalance = myBalance.subtract(s.getAmount());
            }
        }

        return new GroupDto(
                group,
                memberDtos,
                totalExpenses.setScale(2, RoundingMode.HALF_UP),
                myBalance.setScale(2, RoundingMode.HALF_UP)
        );
    }
}
