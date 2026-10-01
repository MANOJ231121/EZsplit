package com.splitmate.repository;

import com.splitmate.model.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends MongoRepository<Activity, String> {
    List<Activity> findByUserIdsContainingOrderByCreatedAtDesc(String userId);
}
