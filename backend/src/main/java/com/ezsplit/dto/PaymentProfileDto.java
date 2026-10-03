package com.ezsplit.dto;

public class PaymentProfileDto {
    private String userId;
    private String name;
    private String upiId;
    private String upiIntentUri;
    private String upiQrImage;
    private boolean canRequestPayment;

    public PaymentProfileDto() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
    public String getUpiIntentUri() { return upiIntentUri; }
    public void setUpiIntentUri(String upiIntentUri) { this.upiIntentUri = upiIntentUri; }
    public String getUpiQrImage() { return upiQrImage; }
    public void setUpiQrImage(String upiQrImage) { this.upiQrImage = upiQrImage; }
    public boolean isCanRequestPayment() { return canRequestPayment; }
    public void setCanRequestPayment(boolean canRequestPayment) { this.canRequestPayment = canRequestPayment; }
}