package com.ezsplit.model;

import com.ezsplit.model.enums.ActivityType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "activities")
public class Activity {

    @Id
    private String id;

    private List<String> userIds = new ArrayList<>(); // Users involved who should see this activity
    private String actorId; // Person who triggered activity
    private ActivityType type;
    private String title;
    private String description;
    private String targetId; // Expense ID, Group ID, etc.
    private Instant createdAt = Instant.now();

    public Activity() {}

    public Activity(List<String> userIds, String actorId, ActivityType type, String title, String description, String targetId) {
        this.userIds = userIds != null ? userIds : new ArrayList<>();
        this.actorId = actorId;
        this.type = type;
        this.title = title;
        this.description = description;
        this.targetId = targetId;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<String> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<String> userIds) {
        this.userIds = userIds;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public ActivityType getType() {
        return type;
    }

    public void setType(ActivityType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
