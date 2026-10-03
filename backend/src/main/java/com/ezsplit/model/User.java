package com.ezsplit.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    private String googleId;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private String profilePicture;

    private String upiId;

    private String upiQrImage;

    private Boolean paymentSetupComplete = Boolean.FALSE;

    private Boolean paymentSetupDismissed = Boolean.FALSE;

    private List<String> friendIds = new ArrayList<>();

    private Instant createdAt = Instant.now();

    public User() {}

    public User(String googleId, String name, String email, String profilePicture) {
        this.googleId = googleId;
        this.name = name;
        this.email = email;
        this.profilePicture = profilePicture;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getUpiQrImage() {
        return upiQrImage;
    }

    public void setUpiQrImage(String upiQrImage) {
        this.upiQrImage = upiQrImage;
    }

    public Boolean getPaymentSetupComplete() {
        return paymentSetupComplete;
    }

    public void setPaymentSetupComplete(Boolean paymentSetupComplete) {
        this.paymentSetupComplete = paymentSetupComplete;
    }

    public Boolean getPaymentSetupDismissed() {
        return paymentSetupDismissed;
    }

    public void setPaymentSetupDismissed(Boolean paymentSetupDismissed) {
        this.paymentSetupDismissed = paymentSetupDismissed;
    }

    public List<String> getFriendIds() {
        return friendIds;
    }

    public void setFriendIds(List<String> friendIds) {
        this.friendIds = friendIds;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
