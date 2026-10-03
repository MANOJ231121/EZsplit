package com.ezsplit.service;

import com.ezsplit.dto.PaymentProfileDto;
import com.ezsplit.dto.UpdatePaymentProfileRequest;
import com.ezsplit.dto.UserDto;
import com.ezsplit.exception.BadRequestException;
import com.ezsplit.model.Group;
import com.ezsplit.model.User;
import com.ezsplit.repository.GroupRepository;
import com.ezsplit.repository.UserRepository;
import com.ezsplit.util.UpiValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.List;

@Service
public class PaymentService {

    private static final long MAX_QR_BYTES = 400_000L;
    private static final List<String> ALLOWED_QR_TYPES = List.of("image/png", "image/jpeg", "image/jpg", "image/webp");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    public User updatePaymentProfile(String userId, UpdatePaymentProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (req.getName() != null && !req.getName().isBlank()) {
            String trimmed = req.getName().trim();
            if (trimmed.length() > 60) {
                throw new BadRequestException("Name is too long (max 60 characters)");
            }
            user.setName(trimmed);
        }

        if (req.getUpiId() != null) {
            if (req.getUpiId().isBlank()) {
                user.setUpiId(null);
            } else {
                String normalized = UpiValidator.normalize(req.getUpiId());
                if (normalized == null) {
                    throw new BadRequestException(
                            "That does not look like a valid UPI ID. It should look like yourname@okaxis");
                }
                user.setUpiId(normalized);
            }
        }

        // A UPI ID or a QR image is enough to be payable. The QR is the primary route
        // because most people upload a GPay screenshot rather than type a VPA.
        if (Boolean.TRUE.equals(req.getSetupComplete())) {
            if (user.getUpiId() == null && !hasQr(user)) {
                throw new BadRequestException("Add a UPI ID or upload your QR code before finishing payment setup");
            }
            user.setPaymentSetupComplete(Boolean.TRUE);
            user.setPaymentSetupDismissed(Boolean.FALSE);
        }

        if (Boolean.TRUE.equals(req.getSkipSetup())) {
            user.setPaymentSetupDismissed(Boolean.TRUE);
        }

        return userRepository.save(user);
    }

    public User updateQrImage(String userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please choose a QR image to upload");
        }
        if (file.getSize() > MAX_QR_BYTES) {
            throw new BadRequestException("QR image is too large. Please use an image under 400 KB.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_QR_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("QR must be a PNG, JPG or WEBP image");
        }

        try {
            user.setUpiQrImage("data:" + contentType + ";base64,"
                    + Base64.getEncoder().encodeToString(file.getBytes()));
        } catch (IOException e) {
            throw new BadRequestException("Could not read that image. Please try another file.");
        }

        return userRepository.save(user);
    }

    public User removeQrImage(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        user.setUpiQrImage(null);
        return userRepository.save(user);
    }

    public PaymentProfileDto getPayeeProfile(String requesterId, String payeeId, BigDecimal amount, String note) {
        if (requesterId.equals(payeeId)) {
            throw new BadRequestException("You cannot send a payment request to yourself");
        }
        if (!areConnected(requesterId, payeeId)) {
            throw new BadRequestException("You can only pay people who are already your friends or group members");
        }

        User payee = userRepository.findById(payeeId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        PaymentProfileDto dto = new PaymentProfileDto();
        dto.setUserId(payee.getId());
        dto.setName(payee.getName());
        dto.setUpiId(payee.getUpiId());

        boolean hasUpiId = payee.getUpiId() != null && !payee.getUpiId().isBlank();
        boolean hasQr = hasQr(payee);
        dto.setCanRequestPayment(hasUpiId || hasQr);

        // The deep link is only possible with a VPA; a QR-only payee still gets
        // their image, and the frontend shows scan-only instructions.
        if (hasUpiId) {
            dto.setUpiIntentUri(UpiValidator.buildPayUri(
                    payee.getUpiId(),
                    payee.getName(),
                    amount,
                    note != null && !note.isBlank() ? note : "EzSplit settlement",
                    "EZSP" + System.currentTimeMillis()));
        }
        if (hasQr) {
            dto.setUpiQrImage(payee.getUpiQrImage());
        }

        return dto;
    }

    private boolean hasQr(User user) {
        return user.getUpiQrImage() != null && !user.getUpiQrImage().isBlank();
    }

    public String getOwnQrImage(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        String data = user.getUpiQrImage();
        if (data == null || data.isBlank()) {
            throw new BadRequestException("You have not uploaded a QR code yet");
        }
        return data;
    }

    private boolean areConnected(String requesterId, String otherUserId) {
        User requester = userRepository.findById(requesterId).orElse(null);
        if (requester == null) return false;
        if (requester.getFriendIds() != null && requester.getFriendIds().contains(otherUserId)) {
            return true;
        }
        List<Group> groups = groupRepository.findByMemberIdsContaining(otherUserId);
        if (groups == null) return false;
        return groups.stream()
                .anyMatch(g -> g.getMemberIds() != null && g.getMemberIds().contains(requesterId));
    }

    public UserDto toDto(User user) {
        return new UserDto(user);
    }
}