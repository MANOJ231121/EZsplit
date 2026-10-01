package com.splitmate.controller;

import com.splitmate.dto.ApiResponse;
import com.splitmate.model.Activity;
import com.splitmate.security.UserPrincipal;
import com.splitmate.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Activity>>> getUserActivities(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Activity> activities = activityService.getUserActivities(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(activities));
    }
}
