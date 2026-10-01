package com.ezsplit.service;

import com.ezsplit.model.Activity;
import com.ezsplit.model.enums.ActivityType;
import com.ezsplit.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    public Activity logActivity(List<String> userIds, String actorId, ActivityType type, String title, String description, String targetId) {
        Activity activity = new Activity(userIds, actorId, type, title, description, targetId);
        return activityRepository.save(activity);
    }

    public List<Activity> getUserActivities(String userId) {
        return activityRepository.findByUserIdsContainingOrderByCreatedAtDesc(userId);
    }
}
