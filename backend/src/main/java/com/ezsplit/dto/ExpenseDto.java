package com.ezsplit.dto;

import com.ezsplit.model.Expense;
import com.ezsplit.model.ExpenseSplit;
import com.ezsplit.model.enums.SplitType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class ExpenseDto {
    private String id;
    private String groupId;
    private String groupName;
    private String description;
    private BigDecimal amount;
    private UserDto paidBy;
    private SplitType splitType;
    private List<ExpenseSplitDto> participants;
    private String category;
    private UserDto createdBy;
    private Instant date;
    private Instant createdAt;

    // Helper class for detailed participant information
    public static class ExpenseSplitDto {
        private UserDto user;
        private BigDecimal amount;
        private Double percentage;

        public ExpenseSplitDto() {}
        public ExpenseSplitDto(UserDto user, BigDecimal amount, Double percentage) {
            this.user = user;
            this.amount = amount;
            this.percentage = percentage;
        }

        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
    }

    public ExpenseDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public UserDto getPaidBy() { return paidBy; }
    public void setPaidBy(UserDto paidBy) { this.paidBy = paidBy; }
    public SplitType getSplitType() { return splitType; }
    public void setSplitType(SplitType splitType) { this.splitType = splitType; }
    public List<ExpenseSplitDto> getParticipants() { return participants; }
    public void setParticipants(List<ExpenseSplitDto> participants) { this.participants = participants; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public UserDto getCreatedBy() { return createdBy; }
    public void setCreatedBy(UserDto createdBy) { this.createdBy = createdBy; }
    public Instant getDate() { return date; }
    public void setDate(Instant date) { this.date = date; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
