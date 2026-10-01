package com.ezsplit.model;

import com.ezsplit.model.enums.SplitType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "expenses")
public class Expense {

    @Id
    private String id;

    private String groupId; // Nullable if 1-on-1 expense outside a group
    private String description;
    private BigDecimal amount;
    private String paidBy; // User ID who paid
    private SplitType splitType = SplitType.EQUAL;
    private List<ExpenseSplit> participants = new ArrayList<>();
    private String category; // Food, Travel, Utilities, Entertainment, Other
    private String createdBy; // User ID who created record
    private Instant date = Instant.now();
    private Instant createdAt = Instant.now();

    public Expense() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaidBy() {
        return paidBy;
    }

    public void setPaidBy(String paidBy) {
        this.paidBy = paidBy;
    }

    public SplitType getSplitType() {
        return splitType;
    }

    public void setSplitType(SplitType splitType) {
        this.splitType = splitType;
    }

    public List<ExpenseSplit> getParticipants() {
        return participants;
    }

    public void setParticipants(List<ExpenseSplit> participants) {
        this.participants = participants;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
