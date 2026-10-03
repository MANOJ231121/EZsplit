package com.ezsplit.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

public final class UpiValidator {

    // Most real handles have no dot at all (name@okaxis, name@ybl, name@paytm),
    // so the dot-separated suffix must be optional.
    private static final Pattern VPA = Pattern.compile(
            "^[A-Za-z0-9][A-Za-z0-9._-]{1,63}@[A-Za-z0-9][A-Za-z0-9-]{0,31}(\\.[A-Za-z0-9][A-Za-z0-9-]{0,31})*$"
    );

    private static final int MAX_NAME = 50;
    private static final int MAX_NOTE = 80;

    private UpiValidator() {}

    public static boolean isValid(String vpa) {
        return normalize(vpa) != null;
    }

    public static String normalize(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        if (trimmed.isEmpty() || trimmed.length() > 100) return null;
        if (!VPA.matcher(trimmed).matches()) return null;
        int at = trimmed.indexOf('@');
        return trimmed.substring(0, at) + "@" + trimmed.substring(at + 1).toLowerCase();
    }

    public static String buildPayUri(String vpa, String payeeName, BigDecimal amount, String note, String txnRef) {
        String normalized = normalize(vpa);
        if (normalized == null || amount == null) return null;

        StringBuilder uri = new StringBuilder("upi://pay?pa=");
        uri.append(encode(normalized));

        if (payeeName != null && !payeeName.isBlank()) {
            uri.append("&pn=").append(encode(truncate(payeeName.trim(), MAX_NAME)));
        }

        uri.append("&am=").append(amount.setScale(2, RoundingMode.HALF_UP).toPlainString());
        uri.append("&cu=INR");

        if (note != null && !note.isBlank()) {
            uri.append("&tn=").append(encode(truncate(note.trim(), MAX_NOTE)));
        }
        if (txnRef != null && !txnRef.isBlank()) {
            uri.append("&tr=").append(encode(truncate(txnRef.trim(), 35)));
        }

        return uri.toString();
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8)
                .replace("+", "%20");
    }

    private static String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }
}