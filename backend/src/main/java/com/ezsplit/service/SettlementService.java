package com.ezsplit.service;

import com.ezsplit.dto.CreateSettlementRequest;
import com.ezsplit.dto.SettlementDto;
import com.ezsplit.dto.UserDto;
import com.ezsplit.exception.BadRequestException;
import com.ezsplit.exception.ResourceNotFoundException;
import com.ezsplit.model.*;
import com.ezsplit.model.enums.ActivityType;
import com.ezsplit.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SettlementService {

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ActivityService activityService;

    public SettlementDto createSettlement(String currentUserId, CreateSettlementRequest req) {
        if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Settlement amount must be greater than zero");
        }

        String fromUserId = req.getFromUserId() != null ? req.getFromUserId() : currentUserId;
        String toUserId = req.getToUserId();

        if (fromUserId.equals(toUserId)) {
            throw new BadRequestException("Cannot settle up with yourself");
        }

        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Payer user not found"));
        User toUser = userRepository.findById(toUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient user not found"));

        Settlement settlement = new Settlement(
                req.getGroupId(),
                fromUserId,
                toUserId,
                req.getAmount().setScale(2, RoundingMode.HALF_UP),
                req.getNote() != null ? req.getNote() : "Payment settlement"
        );

        Settlement saved = settlementRepository.save(settlement);

        activityService.logActivity(
                Arrays.asList(fromUserId, toUserId),
                currentUserId,
                ActivityType.SETTLEMENT_CREATED,
                "Settled Up",
                fromUser.getName() + " paid " + toUser.getName() + " ₹" + saved.getAmount(),
                saved.getId()
        );

        return convertToDto(saved);
    }

    public List<SettlementDto> getUserSettlements(String currentUserId) {
        List<Settlement> settlements = settlementRepository.findByFromUserIdOrToUserIdOrderByCreatedAtDesc(currentUserId, currentUserId);
        return settlements.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<SettlementDto> getGroupSettlements(String groupId) {
        List<Settlement> settlements = settlementRepository.findByGroupId(groupId);
        return settlements.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public SettlementDto convertToDto(Settlement s) {
        SettlementDto dto = new SettlementDto();
        dto.setId(s.getId());
        dto.setGroupId(s.getGroupId());
        if (s.getGroupId() != null) {
            groupRepository.findById(s.getGroupId()).ifPresent(g -> dto.setGroupName(g.getName()));
        }

        userRepository.findById(s.getFromUserId()).ifPresent(u -> dto.setFromUser(new UserDto(u)));
        userRepository.findById(s.getToUserId()).ifPresent(u -> dto.setToUser(new UserDto(u)));

        dto.setAmount(s.getAmount());
        dto.setNote(s.getNote());
        dto.setCreatedAt(s.getCreatedAt());

        return dto;
    }
}
