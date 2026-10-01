package com.splitmate.service;

import com.splitmate.model.Activity;
import com.splitmate.model.enums.ActivityType;
import com.splitmate.repository.ActivityRepository;
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
