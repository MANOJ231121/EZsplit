package com.splitmate.controller;

import com.splitmate.dto.*;
import com.splitmate.exception.BadRequestException;
import com.splitmate.model.User;
import com.splitmate.repository.UserRepository;
import com.splitmate.security.GoogleTokenVerifierService;
import com.splitmate.security.JwtTokenProvider;
import com.splitmate.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private GoogleTokenVerifierService googleTokenVerifierService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(new UserDto(user)));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        User user = googleTokenVerifierService.verifyAndSaveGoogleUser(request.getIdToken());
        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        AuthResponse response = new AuthResponse(token, new UserDto(user));
        return ResponseEntity.ok(ApiResponse.success("Logged in successfully with Google", response));
    }

    @PostMapping("/demo")
    public ResponseEntity<ApiResponse<AuthResponse>> demoLogin(@RequestBody DemoLoginRequest request) {
        String email = (request.getEmail() != null && !request.getEmail().isBlank()) ? request.getEmail() : "manoj@gmail.com";
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User("google_demo_" + System.currentTimeMillis(), "Demo User", email, "https://api.dicebear.com/7.x/avataaars/svg?seed=" + email);
                    return userRepository.save(newUser);
                });

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        AuthResponse response = new AuthResponse(token, new UserDto(user));
        return ResponseEntity.ok(ApiResponse.success("Switched to demo user: " + user.getName(), response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", "Logged out"));
    }
}
