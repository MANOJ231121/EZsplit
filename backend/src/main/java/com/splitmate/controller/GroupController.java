package com.splitmate.controller;

import com.splitmate.dto.*;
import com.splitmate.model.Expense;
import com.splitmate.model.Group;
import com.splitmate.model.Settlement;
import com.splitmate.repository.ExpenseRepository;
import com.splitmate.repository.GroupRepository;
import com.splitmate.repository.SettlementRepository;
import com.splitmate.security.UserPrincipal;
import com.splitmate.service.GroupService;
import com.splitmate.service.SettlementEngineService;
import com.splitmate.service.SettlementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private SettlementEngineService settlementEngineService;

    @Autowired
    private SettlementService settlementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GroupDto>>> getGroups(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<GroupDto> groups = groupService.getUserGroups(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GroupDto>> createGroup(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateGroupRequest req) {
        GroupDto group = groupService.createGroup(currentUser.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Group created successfully", group));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupDto>> getGroupById(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id) {
        GroupDto group = groupService.getGroupById(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(group));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<GroupDto>> addMember(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        GroupDto group = groupService.addMemberToGroup(currentUser.getId(), id, userId);
        return ResponseEntity.ok(ApiResponse.success("Member added to group", group));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<String>> removeMember(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id,
            @PathVariable String userId) {
        groupService.removeMemberFromGroup(currentUser.getId(), id, userId);
        return ResponseEntity.ok(ApiResponse.success("Member removed from group", "Removed"));
    }

    @GetMapping("/{id}/balances")
    public ResponseEntity<ApiResponse<GroupBalanceDto>> getGroupBalances(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id) {
        GroupDto groupDto = groupService.getGroupById(currentUser.getId(), id);
        Group group = groupRepository.findById(id).orElseThrow();

        List<Expense> expenses = expenseRepository.findByGroupIdOrderByDateDesc(id);
        List<Settlement> settlements = settlementRepository.findByGroupId(id);

        GroupBalanceDto balances = settlementEngineService.calculateBalancesAndSettlements(
                group.getMemberIds(), expenses, settlements);

        return ResponseEntity.ok(ApiResponse.success(balances));
    }

    @GetMapping("/{id}/settlements")
    public ResponseEntity<ApiResponse<List<SettlementDto>>> getGroupSettlements(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id) {
        groupService.getGroupById(currentUser.getId(), id); // Validate membership
        List<SettlementDto> settlements = settlementService.getGroupSettlements(id);
        return ResponseEntity.ok(ApiResponse.success(settlements));
    }
}
