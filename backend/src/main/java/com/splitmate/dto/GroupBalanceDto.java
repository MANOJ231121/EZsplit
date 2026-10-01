package com.splitmate.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class GroupBalanceDto {

    private List<MemberBalance> memberBalances = new ArrayList<>();
    private List<SimplifiedTransaction> simplifiedTransactions = new ArrayList<>();

    public static class MemberBalance {
        private UserDto user;
        private BigDecimal netBalance; // positive = owed money, negative = owes money

        public MemberBalance() {}
        public MemberBalance(UserDto user, BigDecimal netBalance) {
            this.user = user;
            this.netBalance = netBalance;
        }

        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
        public BigDecimal getNetBalance() { return netBalance; }
        public void setNetBalance(BigDecimal netBalance) { this.netBalance = netBalance; }
    }

    public static class SimplifiedTransaction {
        private UserDto fromUser; // Person who pays
        private UserDto toUser;   // Person who gets paid
        private BigDecimal amount;

        public SimplifiedTransaction() {}
        public SimplifiedTransaction(UserDto fromUser, UserDto toUser, BigDecimal amount) {
            this.fromUser = fromUser;
            this.toUser = toUser;
            this.amount = amount;
        }

        public UserDto getFromUser() { return fromUser; }
        public void setFromUser(UserDto fromUser) { this.fromUser = fromUser; }
        public UserDto getToUser() { return toUser; }
        public void setToUser(UserDto toUser) { this.toUser = toUser; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }

    public GroupBalanceDto() {}

    public GroupBalanceDto(List<MemberBalance> memberBalances, List<SimplifiedTransaction> simplifiedTransactions) {
        this.memberBalances = memberBalances != null ? memberBalances : new ArrayList<>();
        this.simplifiedTransactions = simplifiedTransactions != null ? simplifiedTransactions : new ArrayList<>();
    }

    public List<MemberBalance> getMemberBalances() { return memberBalances; }
    public void setMemberBalances(List<MemberBalance> memberBalances) { this.memberBalances = memberBalances; }
    public List<SimplifiedTransaction> getSimplifiedTransactions() { return simplifiedTransactions; }
    public void setSimplifiedTransactions(List<SimplifiedTransaction> simplifiedTransactions) { this.simplifiedTransactions = simplifiedTransactions; }
}
