package com.ezsplit.dto;

import com.ezsplit.model.User;
import java.time.Instant;

public class UserDto {
    private String id;
    private String googleId;
    private String name;
    private String email;
    private String profilePicture;
    private Instant createdAt;

    public UserDto() {}

    public UserDto(User user) {
        if (user != null) {
            this.id = user.getId();
            this.googleId = user.getGoogleId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.profilePicture = user.getProfilePicture();
            this.createdAt = user.getCreatedAt();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
