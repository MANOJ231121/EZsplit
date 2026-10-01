package com.splitmate.dto;

import com.splitmate.model.Activity;
import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDto {
    private BigDecimal youOwe = BigDecimal.ZERO;
    private BigDecimal youAreOwed = BigDecimal.ZERO;
    private BigDecimal netBalance = BigDecimal.ZERO;
    private List<GroupDto> activeGroups;
    private List<ExpenseDto> recentExpenses;
    private List<Activity> recentActivities;

    public DashboardSummaryDto() {}

    public BigDecimal getYouOwe() { return youOwe; }
    public void setYouOwe(BigDecimal youOwe) { this.youOwe = youOwe; }
    public BigDecimal getYouAreOwed() { return youAreOwed; }
    public void setYouAreOwed(BigDecimal youAreOwed) { this.youAreOwed = youAreOwed; }
    public BigDecimal getNetBalance() { return netBalance; }
    public void setNetBalance(BigDecimal netBalance) { this.netBalance = netBalance; }
    public List<GroupDto> getActiveGroups() { return activeGroups; }
    public void setActiveGroups(List<GroupDto> activeGroups) { this.activeGroups = activeGroups; }
    public List<ExpenseDto> getRecentExpenses() { return recentExpenses; }
    public void setRecentExpenses(List<ExpenseDto> recentExpenses) { this.recentExpenses = recentExpenses; }
    public List<Activity> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<Activity> recentActivities) { this.recentActivities = recentActivities; }
}
