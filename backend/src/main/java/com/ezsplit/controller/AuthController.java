package com.ezsplit.controller;

import com.ezsplit.dto.*;
import com.ezsplit.exception.BadRequestException;
import com.ezsplit.model.User;
import com.ezsplit.repository.UserRepository;
import com.ezsplit.security.GoogleTokenVerifierService;
import com.ezsplit.security.JwtTokenProvider;
import com.ezsplit.security.UserPrincipal;
import com.ezsplit.service.UserService;
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

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(new UserDto(user)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        AuthResponse response = new AuthResponse(token, new UserDto(user));
        return ResponseEntity.ok(ApiResponse.success("Account created successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(request.getEmail(), request.getPassword());
        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        AuthResponse response = new AuthResponse(token, new UserDto(user));
        return ResponseEntity.ok(ApiResponse.success("Logged in successfully", response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        User user = googleTokenVerifierService.verifyAndSaveGoogleUser(request.getIdToken());
        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        AuthResponse response = new AuthResponse(token, new UserDto(user));
        return ResponseEntity.ok(ApiResponse.success("Logged in successfully with Google", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", "Logged out"));
    }
}
