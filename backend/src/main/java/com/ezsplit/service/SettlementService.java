package com.ezsplit.service;

import com.ezsplit.dto.CreateSettlementRequest;
import com.ezsplit.dto.SettlementDto;
import com.ezsplit.dto.UserDto;
import com.ezsplit.exception.BadRequestException;
import com.ezsplit.exception.ResourceNotFoundException;
import com.ezsplit.model.*;
import com.ezsplit.model.enums.ActivityType;
import com.ezsplit.model.enums.SettlementStatus;
import com.ezsplit.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
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
        settlement.setStatus(SettlementStatus.PENDING.name());
        settlement.setPaymentRef("EZSP" + System.currentTimeMillis());

        Settlement saved = settlementRepository.save(settlement);

        activityService.logActivity(
                Arrays.asList(fromUserId, toUserId),
                currentUserId,
                ActivityType.SETTLEMENT_CREATED,
                "Payment sent",
                fromUser.getName() + " sent " + toUser.getName() + " ?" + saved.getAmount(),
                saved.getId()
        );

        return convertToDto(saved);
    }

    public SettlementDto confirmSettlement(String currentUserId, String settlementId) {
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found"));

        if (!settlement.getToUserId().equals(currentUserId)) {
            throw new BadRequestException("Only the person receiving the money can confirm it");
        }
        if (!SettlementStatus.PENDING.name().equals(settlement.getStatus())) {
            throw new BadRequestException("This payment has already been " + settlement.getStatus().toLowerCase());
        }

        settlement.setStatus(SettlementStatus.CONFIRMED.name());
        settlement.setConfirmedAt(Instant.now());
        Settlement saved = settlementRepository.save(settlement);

        User fromUser = userRepository.findById(saved.getFromUserId()).orElse(null);
        User toUser = userRepository.findById(saved.getToUserId()).orElse(null);

        activityService.logActivity(
                Arrays.asList(saved.getFromUserId(), saved.getToUserId()),
                currentUserId,
                ActivityType.SETTLEMENT_CONFIRMED,
                "Payment received",
                (fromUser != null ? fromUser.getName() : "Someone") + " paid "
                        + (toUser != null ? toUser.getName() : "you") + " ?" + saved.getAmount(),
                saved.getId()
        );

        return convertToDto(saved);
    }

    public SettlementDto cancelSettlement(String currentUserId, String settlementId) {
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement not found"));

        if (!settlement.getFromUserId().equals(currentUserId)) {
            throw new BadRequestException("Only the person who sent the payment can cancel it");
        }
        if (!SettlementStatus.PENDING.name().equals(settlement.getStatus())) {
            throw new BadRequestException("Only a pending payment can be cancelled");
        }

        settlement.setStatus(SettlementStatus.CANCELLED.name());
        return convertToDto(settlementRepository.save(settlement));
    }

    public List<SettlementDto> getPendingIncoming(String currentUserId) {
        return settlementRepository.findByToUserIdAndStatusOrderByCreatedAtDesc(
                        currentUserId, SettlementStatus.PENDING.name()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<SettlementDto> getPendingOutgoing(String currentUserId) {
        return settlementRepository.findByFromUserIdAndStatusOrderByCreatedAtDesc(
                        currentUserId, SettlementStatus.PENDING.name()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public static boolean isCounted(Settlement settlement) {
        if (settlement == null) return false;
        String status = settlement.getStatus();
        return status == null || SettlementStatus.CONFIRMED.name().equals(status);
    }

    public static List<Settlement> confirmedOnly(List<Settlement> settlements) {
        if (settlements == null) return new java.util.ArrayList<>();
        return settlements.stream().filter(SettlementService::isCounted).collect(Collectors.toList());
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
        dto.setStatus(s.getStatus() == null ? SettlementStatus.CONFIRMED.name() : s.getStatus());
        dto.setPaymentRef(s.getPaymentRef());
        dto.setConfirmedAt(s.getConfirmedAt());
        dto.setCreatedAt(s.getCreatedAt());

        return dto;
    }
}
