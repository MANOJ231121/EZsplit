package com.splitmate.service;

import com.splitmate.dto.GroupBalanceDto;
import com.splitmate.dto.UserDto;
import com.splitmate.model.Expense;
import com.splitmate.model.ExpenseSplit;
import com.splitmate.model.Settlement;
import com.splitmate.model.User;
import com.splitmate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class SettlementEngineService {

    @Autowired
    private UserRepository userRepository;

    public GroupBalanceDto calculateBalancesAndSettlements(
            List<String> memberIds,
            List<Expense> expenses,
            List<Settlement> settlements) {

        Map<String, UserDto> userMap = new HashMap<>();
        if (memberIds != null && !memberIds.isEmpty()) {
            List<User> users = userRepository.findByIdIn(memberIds);
            for (User u : users) {
                userMap.put(u.getId(), new UserDto(u));
            }
        }

        // Map to keep track of net balance per userId (Positive = owed money, Negative = owes money)
        Map<String, BigDecimal> netBalances = new HashMap<>();
        for (String id : memberIds) {
            netBalances.put(id, BigDecimal.ZERO);
        }

        // Process Expenses
        if (expenses != null) {
            for (Expense exp : expenses) {
                String paidBy = exp.getPaidBy();
                if (!netBalances.containsKey(paidBy) && paidBy != null) {
                    netBalances.put(paidBy, BigDecimal.ZERO);
                    if (!userMap.containsKey(paidBy)) {
                        userRepository.findById(paidBy).ifPresent(u -> userMap.put(u.getId(), new UserDto(u)));
                    }
                }

                if (exp.getParticipants() != null) {
                    for (ExpenseSplit split : exp.getParticipants()) {
                        String participantId = split.getUserId();
                        BigDecimal share = split.getAmount() != null ? split.getAmount() : BigDecimal.ZERO;

                        if (!netBalances.containsKey(participantId) && participantId != null) {
                            netBalances.put(participantId, BigDecimal.ZERO);
                            if (!userMap.containsKey(participantId)) {
                                userRepository.findById(participantId).ifPresent(u -> userMap.put(u.getId(), new UserDto(u)));
                            }
                        }

                        if (!paidBy.equals(participantId)) {
                            // paidBy is owed money by participant
                            netBalances.put(paidBy, netBalances.get(paidBy).add(share));
                            netBalances.put(participantId, netBalances.get(participantId).subtract(share));
                        }
                    }
                }
            }
        }

        // Process Settlements
        if (settlements != null) {
            for (Settlement s : settlements) {
                String fromUser = s.getFromUserId();
                String toUser = s.getToUserId();
                BigDecimal amount = s.getAmount() != null ? s.getAmount() : BigDecimal.ZERO;

                if (netBalances.containsKey(fromUser)) {
                    // fromUser paid back money -> debt decreased -> net balance increases towards 0
                    netBalances.put(fromUser, netBalances.get(fromUser).add(amount));
                }
                if (netBalances.containsKey(toUser)) {
                    // toUser received money -> credit decreased -> net balance decreases towards 0
                    netBalances.put(toUser, netBalances.get(toUser).subtract(amount));
                }
            }
        }

        // Build MemberBalance DTO list
        List<GroupBalanceDto.MemberBalance> memberBalances = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : netBalances.entrySet()) {
            UserDto userDto = userMap.get(entry.getKey());
            if (userDto == null) {
                userDto = new UserDto();
                userDto.setId(entry.getKey());
                userDto.setName("User (" + entry.getKey().substring(0, Math.min(4, entry.getKey().length())) + ")");
            }
            BigDecimal roundedBalance = entry.getValue().setScale(2, RoundingMode.HALF_UP);
            memberBalances.add(new GroupBalanceDto.MemberBalance(userDto, roundedBalance));
        }

        // Run Greedy Min-Transfers Algorithm to minimize settlement transactions
        List<GroupBalanceDto.SimplifiedTransaction> simplifiedTransactions = simplifyDebts(netBalances, userMap);

        return new GroupBalanceDto(memberBalances, simplifiedTransactions);
    }

    private List<GroupBalanceDto.SimplifiedTransaction> simplifyDebts(
            Map<String, BigDecimal> netBalances, Map<String, UserDto> userMap) {

        class Pair {
            String userId;
            BigDecimal amount;
            Pair(String u, BigDecimal a) { userId = u; amount = a; }
        }

        List<Pair> debtors = new ArrayList<>();
        List<Pair> creditors = new ArrayList<>();

        for (Map.Entry<String, BigDecimal> entry : netBalances.entrySet()) {
            BigDecimal val = entry.getValue().setScale(2, RoundingMode.HALF_UP);
            if (val.compareTo(new BigDecimal("-0.01")) < 0) {
                debtors.add(new Pair(entry.getKey(), val.abs()));
            } else if (val.compareTo(new BigDecimal("0.01")) > 0) {
                creditors.add(new Pair(entry.getKey(), val));
            }
        }

        List<GroupBalanceDto.SimplifiedTransaction> transactions = new ArrayList<>();

        int dIdx = 0;
        int cIdx = 0;

        while (dIdx < debtors.size() && cIdx < creditors.size()) {
            Pair debtor = debtors.get(dIdx);
            Pair creditor = creditors.get(cIdx);

            BigDecimal settleAmount = debtor.amount.min(creditor.amount).setScale(2, RoundingMode.HALF_UP);

            if (settleAmount.compareTo(new BigDecimal("0.01")) >= 0) {
                UserDto fromUser = userMap.get(debtor.userId);
                UserDto toUser = userMap.get(creditor.userId);
                transactions.add(new GroupBalanceDto.SimplifiedTransaction(fromUser, toUser, settleAmount));
            }

            debtor.amount = debtor.amount.subtract(settleAmount);
            creditor.amount = creditor.amount.subtract(settleAmount);

            if (debtor.amount.compareTo(new BigDecimal("0.01")) < 0) {
                dIdx++;
            }
            if (creditor.amount.compareTo(new BigDecimal("0.01")) < 0) {
                cIdx++;
            }
        }

        return transactions;
    }
}
