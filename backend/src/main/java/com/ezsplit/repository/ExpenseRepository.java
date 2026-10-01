package com.ezsplit.repository;

import com.ezsplit.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByGroupIdOrderByDateDesc(String groupId);
    List<Expense> findByPaidByOrParticipantsUserIdOrderByDateDesc(String paidById, String participantUserId);
    List<Expense> findByGroupIdInOrderByDateDesc(List<String> groupIds);
}
