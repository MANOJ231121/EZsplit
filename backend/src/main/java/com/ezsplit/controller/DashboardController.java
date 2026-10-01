package com.ezsplit.controller;

import com.ezsplit.dto.ApiResponse;
import com.ezsplit.dto.DashboardSummaryDto;
import com.ezsplit.security.UserPrincipal;
import com.ezsplit.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary(@AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardSummaryDto summary = dashboardService.getDashboardSummary(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
