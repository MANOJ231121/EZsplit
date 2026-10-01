package com.ezsplit.service;

import com.ezsplit.dto.DashboardSummaryDto;
import com.ezsplit.dto.FriendDto;
import com.ezsplit.dto.GroupDto;
import com.ezsplit.dto.ExpenseDto;
import com.ezsplit.model.Activity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private FriendService friendService;

    @Autowired
    private GroupService groupService;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private ActivityService activityService;

    public DashboardSummaryDto getDashboardSummary(String currentUserId) {
        DashboardSummaryDto summary = new DashboardSummaryDto();

        // Calculate total balances from friends
        List<FriendDto> friends = friendService.getUserFriendsWithBalances(currentUserId);
        BigDecimal totalYouOwe = BigDecimal.ZERO;
        BigDecimal totalYouAreOwed = BigDecimal.ZERO;

        for (FriendDto friend : friends) {
            BigDecimal bal = friend.getBalance();
            if (bal.compareTo(BigDecimal.ZERO) > 0) {
                totalYouAreOwed = totalYouAreOwed.add(bal);
            } else if (bal.compareTo(BigDecimal.ZERO) < 0) {
                totalYouOwe = totalYouOwe.add(bal.abs());
            }
        }

        BigDecimal netBalance = totalYouAreOwed.subtract(totalYouOwe).setScale(2, RoundingMode.HALF_UP);

        summary.setYouOwe(totalYouOwe.setScale(2, RoundingMode.HALF_UP));
        summary.setYouAreOwed(totalYouAreOwed.setScale(2, RoundingMode.HALF_UP));
        summary.setNetBalance(netBalance);

        // Fetch active groups
        List<GroupDto> groups = groupService.getUserGroups(currentUserId);
        summary.setActiveGroups(groups);

        // Fetch recent expenses
        List<ExpenseDto> recentExpenses = expenseService.getRecentExpenses(currentUserId);
        summary.setRecentExpenses(recentExpenses);

        // Fetch recent activities
        List<Activity> recentActivities = activityService.getUserActivities(currentUserId);
        if (recentActivities.size() > 10) {
            recentActivities = recentActivities.subList(0, 10);
        }
        summary.setRecentActivities(recentActivities);

        return summary;
    }
}
