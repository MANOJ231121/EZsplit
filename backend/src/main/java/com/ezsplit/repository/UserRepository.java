package com.ezsplit.repository;

import com.ezsplit.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    List<User> findByIdIn(List<String> ids);
    List<User> findByEmailContainingIgnoreCase(String query);
}
