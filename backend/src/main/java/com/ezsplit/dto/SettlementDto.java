package com.ezsplit.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class SettlementDto {
    private String id;
    private String groupId;
    private String groupName;
    private UserDto fromUser;
    private UserDto toUser;
    private BigDecimal amount;
    private String note;
    private Instant createdAt;

    public SettlementDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    public UserDto getFromUser() { return fromUser; }
    public void setFromUser(UserDto fromUser) { this.fromUser = fromUser; }
    public UserDto getToUser() { return toUser; }
    public void setToUser(UserDto toUser) { this.toUser = toUser; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
