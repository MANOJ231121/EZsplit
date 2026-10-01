package com.ezsplit.dto;

import com.ezsplit.model.Group;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class GroupDto {
    private String id;
    private String name;
    private String description;
    private String category;
    private String createdBy;
    private List<UserDto> members;
    private BigDecimal totalExpenses = BigDecimal.ZERO;
    private BigDecimal myBalance = BigDecimal.ZERO; // Positive: owed to user, Negative: user owes
    private Instant createdAt;

    public GroupDto() {}

    public GroupDto(Group group, List<UserDto> members, BigDecimal totalExpenses, BigDecimal myBalance) {
        if (group != null) {
            this.id = group.getId();
            this.name = group.getName();
            this.description = group.getDescription();
            this.category = group.getCategory();
            this.createdBy = group.getCreatedBy();
            this.createdAt = group.getCreatedAt();
        }
        this.members = members;
        this.totalExpenses = totalExpenses != null ? totalExpenses : BigDecimal.ZERO;
        this.myBalance = myBalance != null ? myBalance : BigDecimal.ZERO;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public List<UserDto> getMembers() { return members; }
    public void setMembers(List<UserDto> members) { this.members = members; }
    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }
    public BigDecimal getMyBalance() { return myBalance; }
    public void setMyBalance(BigDecimal myBalance) { this.myBalance = myBalance; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
