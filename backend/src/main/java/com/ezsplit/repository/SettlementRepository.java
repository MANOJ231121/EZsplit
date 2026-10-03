package com.ezsplit.repository;

import com.ezsplit.model.Settlement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SettlementRepository extends MongoRepository<Settlement, String> {
    List<Settlement> findByGroupId(String groupId);
    List<Settlement> findByFromUserIdOrToUserIdOrderByCreatedAtDesc(String fromUserId, String toUserId);
    List<Settlement> findByGroupIdInOrderByCreatedAtDesc(List<String> groupIds);
    List<Settlement> findByToUserIdAndStatusOrderByCreatedAtDesc(String toUserId, String status);
    List<Settlement> findByFromUserIdAndStatusOrderByCreatedAtDesc(String fromUserId, String status);
}
