package com.ezsplit.repository;

import com.ezsplit.model.FriendRequest;
import com.ezsplit.model.enums.RequestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends MongoRepository<FriendRequest, String> {
    List<FriendRequest> findByReceiverIdAndStatus(String receiverId, RequestStatus status);
    List<FriendRequest> findBySenderIdAndStatus(String senderId, RequestStatus status);
    Optional<FriendRequest> findBySenderIdAndReceiverId(String senderId, String receiverId);
}
