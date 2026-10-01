package com.splitmate.service;

import com.splitmate.dto.FriendDto;
import com.splitmate.dto.FriendRequestDto;
import com.splitmate.dto.UserDto;
import com.splitmate.exception.BadRequestException;
import com.splitmate.exception.ResourceNotFoundException;
import com.splitmate.model.*;
import com.splitmate.model.enums.ActivityType;
import com.splitmate.model.enums.RequestStatus;
import com.splitmate.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class FriendService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private ActivityService activityService;

    public FriendRequestDto sendFriendRequest(String currentUserId, String targetEmail) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (currentUser.getEmail().equalsIgnoreCase(targetEmail)) {
            throw new BadRequestException("You cannot send a friend request to yourself");
        }

        User targetUser = userRepository.findByEmail(targetEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User with email " + targetEmail + " not found"));

        if (currentUser.getFriendIds().contains(targetUser.getId())) {
            throw new BadRequestException("You are already friends with " + targetUser.getName());
        }

        Optional<FriendRequest> existingOpt = friendRequestRepository.findBySenderIdAndReceiverId(currentUserId, targetUser.getId());
        if (existingOpt.isPresent()) {
            FriendRequest existing = existingOpt.get();
            if (existing.getStatus() == RequestStatus.PENDING) {
                throw new BadRequestException("Friend request already sent and pending");
            }
        }

        FriendRequest request = new FriendRequest(currentUserId, targetUser.getId());
        FriendRequest saved = friendRequestRepository.save(request);

        activityService.logActivity(
                Arrays.asList(currentUserId, targetUser.getId()),
                currentUserId,
                ActivityType.FRIEND_REQUEST_SENT,
                "Friend Request",
                currentUser.getName() + " sent a friend request to " + targetUser.getName(),
                saved.getId()
        );

        FriendRequestDto dto = new FriendRequestDto();
        dto.setId(saved.getId());
        dto.setSender(new UserDto(currentUser));
        dto.setReceiver(new UserDto(targetUser));
        dto.setStatus(saved.getStatus());
        dto.setCreatedAt(saved.getCreatedAt());

        return dto;
    }

    public List<FriendRequestDto> getPendingRequests(String currentUserId) {
        List<FriendRequest> requests = friendRequestRepository.findByReceiverIdAndStatus(currentUserId, RequestStatus.PENDING);
        List<FriendRequestDto> dtos = new ArrayList<>();

        for (FriendRequest req : requests) {
            User sender = userRepository.findById(req.getSenderId()).orElse(null);
            User receiver = userRepository.findById(req.getReceiverId()).orElse(null);
            if (sender != null && receiver != null) {
                FriendRequestDto dto = new FriendRequestDto();
                dto.setId(req.getId());
                dto.setSender(new UserDto(sender));
                dto.setReceiver(new UserDto(receiver));
                dto.setStatus(req.getStatus());
                dto.setCreatedAt(req.getCreatedAt());
                dtos.add(dto);
            }
        }

        return dtos;
    }

    public FriendRequestDto acceptFriendRequest(String currentUserId, String requestId) {
        FriendRequest req = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));

        if (!req.getReceiverId().equals(currentUserId)) {
            throw new BadRequestException("You are not authorized to accept this friend request");
        }

        req.setStatus(RequestStatus.ACCEPTED);
        FriendRequest updated = friendRequestRepository.save(req);

        User sender = userRepository.findById(req.getSenderId()).orElseThrow(() -> new ResourceNotFoundException("Sender user not found"));
        User receiver = userRepository.findById(req.getReceiverId()).orElseThrow(() -> new ResourceNotFoundException("Receiver user not found"));

        if (!sender.getFriendIds().contains(receiver.getId())) {
            sender.getFriendIds().add(receiver.getId());
            userRepository.save(sender);
        }
        if (!receiver.getFriendIds().contains(sender.getId())) {
            receiver.getFriendIds().add(sender.getId());
            userRepository.save(receiver);
        }

        activityService.logActivity(
                Arrays.asList(sender.getId(), receiver.getId()),
                currentUserId,
                ActivityType.FRIEND_REQUEST_ACCEPTED,
                "Friend Added",
                receiver.getName() + " accepted " + sender.getName() + "'s friend request",
                updated.getId()
        );

        FriendRequestDto dto = new FriendRequestDto();
        dto.setId(updated.getId());
        dto.setSender(new UserDto(sender));
        dto.setReceiver(new UserDto(receiver));
        dto.setStatus(updated.getStatus());
        dto.setCreatedAt(updated.getCreatedAt());

        return dto;
    }

    public void rejectFriendRequest(String currentUserId, String requestId) {
        FriendRequest req = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));

        if (!req.getReceiverId().equals(currentUserId)) {
            throw new BadRequestException("You are not authorized to reject this friend request");
        }

        req.setStatus(RequestStatus.REJECTED);
        friendRequestRepository.save(req);
    }

    public List<FriendDto> getUserFriendsWithBalances(String currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<String> friendIds = currentUser.getFriendIds();
        if (friendIds == null || friendIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<User> friends = userRepository.findByIdIn(friendIds);
        List<Expense> userExpenses = expenseRepository.findByPaidByOrParticipantsUserIdOrderByDateDesc(currentUserId, currentUserId);
        List<Settlement> userSettlements = settlementRepository.findByFromUserIdOrToUserIdOrderByCreatedAtDesc(currentUserId, currentUserId);

        List<FriendDto> friendDtos = new ArrayList<>();

        for (User friend : friends) {
            String friendId = friend.getId();
            BigDecimal netBalance = calculateBalanceBetween(currentUserId, friendId, userExpenses, userSettlements);
            friendDtos.add(new FriendDto(new UserDto(friend), netBalance));
        }

        return friendDtos;
    }

    public BigDecimal calculateBalanceBetween(String currentUserId, String friendId, List<Expense> expenses, List<Settlement> settlements) {
        BigDecimal balance = BigDecimal.ZERO;

        // Process Expenses between currentUser and friendId
        for (Expense exp : expenses) {
            String paidBy = exp.getPaidBy();
            if (paidBy.equals(currentUserId)) {
                // currentUser paid. Find friend's share.
                for (ExpenseSplit split : exp.getParticipants()) {
                    if (split.getUserId().equals(friendId)) {
                        // Friend owes current user
                        balance = balance.add(split.getAmount());
                    }
                }
            } else if (paidBy.equals(friendId)) {
                // Friend paid. Find currentUser's share.
                for (ExpenseSplit split : exp.getParticipants()) {
                    if (split.getUserId().equals(currentUserId)) {
                        // Current user owes friend
                        balance = balance.subtract(split.getAmount());
                    }
                }
            }
        }

        // Process Settlements between currentUser and friendId
        for (Settlement s : settlements) {
            if (s.getFromUserId().equals(currentUserId) && s.getToUserId().equals(friendId)) {
                // Current user paid friend -> user's debt reduced -> balance increases towards zero
                balance = balance.add(s.getAmount());
            } else if (s.getFromUserId().equals(friendId) && s.getToUserId().equals(currentUserId)) {
                // Friend paid current user -> friend's debt reduced -> balance decreases towards zero
                balance = balance.subtract(s.getAmount());
            }
        }

        return balance.setScale(2, RoundingMode.HALF_UP);
    }

    public void removeFriend(String currentUserId, String friendId) {
        User currentUser = userRepository.findById(currentUserId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User friend = userRepository.findById(friendId).orElseThrow(() -> new ResourceNotFoundException("Friend not found"));

        currentUser.getFriendIds().remove(friendId);
        friend.getFriendIds().remove(currentUserId);

        userRepository.save(currentUser);
        userRepository.save(friend);
    }
}
