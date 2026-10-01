package com.ezsplit.model;

import java.math.BigDecimal;

public class ExpenseSplit {

    private String userId;
    private BigDecimal amount;
    private Double percentage;

    public ExpenseSplit() {}

    public ExpenseSplit(String userId, BigDecimal amount, Double percentage) {
        this.userId = userId;
        this.amount = amount;
        this.percentage = percentage;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
}
