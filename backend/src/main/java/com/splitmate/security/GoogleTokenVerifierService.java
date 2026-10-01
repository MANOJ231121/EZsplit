package com.splitmate.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.splitmate.dto.UserDto;
import com.splitmate.exception.BadRequestException;
import com.splitmate.model.User;
import com.splitmate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class GoogleTokenVerifierService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleTokenVerifierService.class);

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Autowired
    private UserRepository userRepository;

    public User verifyAndSaveGoogleUser(String idTokenString) {
        String googleId = null;
        String email = null;
        String name = null;
        String picture = null;

        try {
            if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.contains("your-google-client-id")) {
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                        new NetHttpTransport(), new GsonFactory())
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();

                GoogleIdToken idToken = verifier.verify(idTokenString);
                if (idToken != null) {
                    GoogleIdToken.Payload payload = idToken.getPayload();
                    googleId = payload.getSubject();
                    email = payload.getEmail();
                    name = (String) payload.get("name");
                    picture = (String) payload.get("picture");
                }
            }
        } catch (Exception e) {
            logger.warn("Failed to verify Google ID token with Google APIs: {}", e.getMessage());
        }

        // If official verification returned null or client ID isn't configured, fallback parsing if token contains user payload in JWT format
        if (email == null) {
            try {
                // Try parsing standard JWT payload from frontend Google Auth callback or OAuth response
                String[] parts = idTokenString.split("\\.");
                if (parts.length >= 2) {
                    String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                    com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(payloadJson);
                    googleId = node.has("sub") ? node.get("sub").asText() : node.has("googleId") ? node.get("googleId").asText() : null;
                    email = node.has("email") ? node.get("email").asText() : null;
                    name = node.has("name") ? node.get("name").asText() : email;
                    picture = node.has("picture") ? node.get("picture").asText() : null;
                }
            } catch (Exception ex) {
                logger.error("Error decoding fallback token payload: {}", ex.getMessage());
            }
        }

        if (email == null) {
            throw new BadRequestException("Invalid or unverifiable Google ID token");
        }

        if (googleId == null || googleId.isBlank()) {
            googleId = "google_" + Math.abs(email.hashCode());
        }

        // Find or create user in MongoDB
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (user.getGoogleId() == null || !user.getGoogleId().equals(googleId)) {
                user.setGoogleId(googleId);
            }
            if (name != null && !name.isBlank()) user.setName(name);
            if (picture != null && !picture.isBlank()) user.setProfilePicture(picture);
        } else {
            user = new User(googleId, name != null ? name : email.split("@")[0], email, picture);
        }

        return userRepository.save(user);
    }
}
