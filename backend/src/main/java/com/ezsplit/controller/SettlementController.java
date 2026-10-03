package com.ezsplit.controller;

import com.ezsplit.dto.*;
import com.ezsplit.security.UserPrincipal;
import com.ezsplit.service.SettlementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settlements")
public class SettlementController {

    @Autowired
    private SettlementService settlementService;

    @PostMapping
    public ResponseEntity<ApiResponse<SettlementDto>> createSettlement(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateSettlementRequest req) {
        SettlementDto settlement = settlementService.createSettlement(currentUser.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Settlement recorded successfully", settlement));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SettlementDto>>> getUserSettlements(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<SettlementDto> settlements = settlementService.getUserSettlements(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(settlements));
    }

    @GetMapping("/pending/incoming")
    public ResponseEntity<ApiResponse<List<SettlementDto>>> getPendingIncoming(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.success(settlementService.getPendingIncoming(currentUser.getId())));
    }

    @GetMapping("/pending/outgoing")
    public ResponseEntity<ApiResponse<List<SettlementDto>>> getPendingOutgoing(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.success(settlementService.getPendingOutgoing(currentUser.getId())));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<SettlementDto>> confirm(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed",
                settlementService.confirmSettlement(currentUser.getId(), id)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SettlementDto>> cancel(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Payment cancelled",
                settlementService.cancelSettlement(currentUser.getId(), id)));
    }
}
