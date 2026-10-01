package com.splitmate.dto;

import java.math.BigDecimal;

public class FriendDto {
    private String id;
    private String name;
    private String email;
    private String profilePicture;
    private BigDecimal balance = BigDecimal.ZERO; // Positive: friend owes user, Negative: user owes friend, Zero: settled up
    private String statusText; // "owes you ₹450", "you owe ₹300", "Settled up"

    public FriendDto() {}

    public FriendDto(UserDto user, BigDecimal balance) {
        if (user != null) {
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.profilePicture = user.getProfilePicture();
        }
        this.balance = balance != null ? balance : BigDecimal.ZERO;
        this.updateStatusText();
    }

    public void updateStatusText() {
        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            this.statusText = "owes you ₹" + balance.abs().stripTrailingZeros().toPlainString();
        } else if (balance.compareTo(BigDecimal.ZERO) < 0) {
            this.statusText = "you owe ₹" + balance.abs().stripTrailingZeros().toPlainString();
        } else {
            this.statusText = "Settled up";
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) {
        this.balance = balance;
        this.updateStatusText();
    }
    public String getStatusText() { return statusText; }
    public void setStatusText(String statusText) { this.statusText = statusText; }
}
