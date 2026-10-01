package com.splitmate.dto;

import com.splitmate.model.enums.RequestStatus;
import java.time.Instant;

public class FriendRequestDto {
    private String id;
    private UserDto sender;
    private UserDto receiver;
    private RequestStatus status;
    private Instant createdAt;

    public FriendRequestDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public UserDto getSender() { return sender; }
    public void setSender(UserDto sender) { this.sender = sender; }
    public UserDto getReceiver() { return receiver; }
    public void setReceiver(UserDto receiver) { this.receiver = receiver; }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
