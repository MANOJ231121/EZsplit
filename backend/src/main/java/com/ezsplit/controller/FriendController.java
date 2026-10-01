package com.ezsplit.controller;

import com.ezsplit.dto.*;
import com.ezsplit.security.UserPrincipal;
import com.ezsplit.service.FriendService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FriendDto>>> getFriends(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<FriendDto> friends = friendService.getUserFriendsWithBalances(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(friends));
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<FriendRequestDto>> sendRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody SendFriendRequest req) {
        FriendRequestDto dto = friendService.sendFriendRequest(currentUser.getId(), req.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Friend request sent", dto));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<FriendRequestDto>>> getPendingRequests(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<FriendRequestDto> requests = friendService.getPendingRequests(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PostMapping("/accept/{id}")
    public ResponseEntity<ApiResponse<FriendRequestDto>> acceptRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id) {
        FriendRequestDto dto = friendService.acceptFriendRequest(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Friend request accepted", dto));
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<ApiResponse<String>> rejectRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id) {
        friendService.rejectFriendRequest(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Friend request rejected", "Rejected"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> removeFriend(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id) {
        friendService.removeFriend(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Friend removed successfully", "Removed"));
    }
}
