package com.ezsplit.dto;

import java.math.BigDecimal;

public class FriendDto {
    private String id;
    private String name;
    private String email;
    private String profilePicture;
    private BigDecimal balance = BigDecimal.ZERO; // Positive: friend owes user, Negative: user owes friend, Zero: settled up
    private String statusText; // "They owe you Rs 450", "You owe Rs 300", "All settled"

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
        // Always name who owes whom. The old "owes you" / "you owe" pair was
        // easy to misread at a glance.
        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            this.statusText = "They owe you ₹" + balance.abs().stripTrailingZeros().toPlainString();
        } else if (balance.compareTo(BigDecimal.ZERO) < 0) {
            this.statusText = "You owe ₹" + balance.abs().stripTrailingZeros().toPlainString();
        } else {
            this.statusText = "All settled";
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
