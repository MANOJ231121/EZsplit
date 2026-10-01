package com.ezsplit.repository;

import com.ezsplit.model.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends MongoRepository<Activity, String> {
    List<Activity> findByUserIdsContainingOrderByCreatedAtDesc(String userId);
}
