package com.ezsplit.dto;

public class UpdatePaymentProfileRequest {
    private String name;
    private String upiId;
    private Boolean setupComplete;
    private Boolean skipSetup;

    public UpdatePaymentProfileRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
    public Boolean getSetupComplete() { return setupComplete; }
    public void setSetupComplete(Boolean setupComplete) { this.setupComplete = setupComplete; }
    public Boolean getSkipSetup() { return skipSetup; }
    public void setSkipSetup(Boolean skipSetup) { this.skipSetup = skipSetup; }
}