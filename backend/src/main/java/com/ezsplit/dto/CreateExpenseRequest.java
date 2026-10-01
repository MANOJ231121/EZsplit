package com.ezsplit.dto;

import com.ezsplit.model.ExpenseSplit;
import com.ezsplit.model.enums.SplitType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class CreateExpenseRequest {

    private String groupId;

    @NotBlank(message = "Expense description is required")
    private String description;

    @NotNull(message = "Expense amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotBlank(message = "Paid by user ID is required")
    private String paidBy;

    private SplitType splitType = SplitType.EQUAL;
    private List<ExpenseSplit> participants;
    private String category;

    public CreateExpenseRequest() {}

    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getPaidBy() { return paidBy; }
    public void setPaidBy(String paidBy) { this.paidBy = paidBy; }
    public SplitType getSplitType() { return splitType; }
    public void setSplitType(SplitType splitType) { this.splitType = splitType; }
    public List<ExpenseSplit> getParticipants() { return participants; }
    public void setParticipants(List<ExpenseSplit> participants) { this.participants = participants; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
