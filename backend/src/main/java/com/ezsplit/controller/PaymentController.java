package com.ezsplit.controller;

import com.ezsplit.dto.ApiResponse;
import com.ezsplit.dto.PaymentProfileDto;
import com.ezsplit.dto.UpdatePaymentProfileRequest;
import com.ezsplit.dto.UserDto;
import com.ezsplit.security.UserPrincipal;
import com.ezsplit.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Base64;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody UpdatePaymentProfileRequest request) {
        UserDto updated = paymentService.toDto(
                paymentService.updatePaymentProfile(currentUser.getId(), request));
        return ResponseEntity.ok(ApiResponse.success("Payment profile updated", updated));
    }

    @PostMapping("/qr")
    public ResponseEntity<ApiResponse<UserDto>> uploadQr(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("image") MultipartFile image) {
        UserDto updated = paymentService.toDto(paymentService.updateQrImage(currentUser.getId(), image));
        return ResponseEntity.ok(ApiResponse.success("QR code uploaded", updated));
    }

    @DeleteMapping("/qr")
    public ResponseEntity<ApiResponse<UserDto>> deleteQr(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserDto updated = paymentService.toDto(paymentService.removeQrImage(currentUser.getId()));
        return ResponseEntity.ok(ApiResponse.success("QR code removed", updated));
    }

    @GetMapping("/qr/mine")
    public ResponseEntity<byte[]> getOwnQr(@AuthenticationPrincipal UserPrincipal currentUser) {
        String dataUrl = paymentService.getOwnQrImage(currentUser.getId());
        int comma = dataUrl.indexOf(',');
        String meta = comma > 0 ? dataUrl.substring(5, comma) : "image/png;base64";
        String base64 = comma > 0 ? dataUrl.substring(comma + 1) : dataUrl;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(meta))
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=600")
                .body(Base64.getDecoder().decode(base64));
    }

    @GetMapping("/payee/{userId}")
    public ResponseEntity<ApiResponse<PaymentProfileDto>> getPayee(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String userId,
            @RequestParam(name = "amount", required = false) BigDecimal amount,
            @RequestParam(name = "note", required = false) String note) {
        PaymentProfileDto profile = paymentService.getPayeeProfile(
                currentUser.getId(), userId, amount, note);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}