package com.splitmate.controller;

import com.splitmate.dto.*;
import com.splitmate.security.UserPrincipal;
import com.splitmate.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping("/groups/{groupId}/expenses")
    public ResponseEntity<ApiResponse<List<ExpenseDto>>> getGroupExpenses(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String groupId) {
        List<ExpenseDto> expenses = expenseService.getGroupExpenses(currentUser.getId(), groupId);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    @PostMapping("/groups/{groupId}/expenses")
    public ResponseEntity<ApiResponse<ExpenseDto>> createGroupExpense(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String groupId,
            @Valid @RequestBody CreateExpenseRequest req) {
        req.setGroupId(groupId);
        ExpenseDto expense = expenseService.createExpense(currentUser.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Expense added successfully", expense));
    }

    @PostMapping("/expenses")
    public ResponseEntity<ApiResponse<ExpenseDto>> createGeneralExpense(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateExpenseRequest req) {
        ExpenseDto expense = expenseService.createExpense(currentUser.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Expense added successfully", expense));
    }

    @GetMapping("/expenses/recent")
    public ResponseEntity<ApiResponse<List<ExpenseDto>>> getRecentExpenses(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<ExpenseDto> expenses = expenseService.getRecentExpenses(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    @GetMapping("/expenses/{id}")
    public ResponseEntity<ApiResponse<ExpenseDto>> getExpenseById(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id) {
        ExpenseDto expense = expenseService.getExpenseById(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(expense));
    }

    @PutMapping("/expenses/{id}")
    public ResponseEntity<ApiResponse<ExpenseDto>> updateExpense(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id,
            @Valid @RequestBody CreateExpenseRequest req) {
        ExpenseDto updated = expenseService.updateExpense(currentUser.getId(), id, req);
        return ResponseEntity.ok(ApiResponse.success("Expense updated successfully", updated));
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<ApiResponse<String>> deleteExpense(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String id) {
        expenseService.deleteExpense(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", "Deleted"));
    }
}
