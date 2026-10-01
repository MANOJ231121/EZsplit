package com.ezsplit.service;

import com.ezsplit.dto.RegisterRequest;
import com.ezsplit.dto.UserDto;
import com.ezsplit.exception.BadRequestException;
import com.ezsplit.exception.InvalidCredentialsException;
import com.ezsplit.exception.ResourceNotFoundException;
import com.ezsplit.model.User;
import com.ezsplit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public UserDto getUserDtoById(String id) {
        return new UserDto(getUserById(id));
    }

    public List<User> searchUsers(String query) {
        return userRepository.findByEmailContainingIgnoreCase(query);
    }

    public User register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("An account with this email already exists. Try signing in instead.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setProfilePicture("https://api.dicebear.com/7.x/initials/svg?seed=" + email);

        return userRepository.save(user);
    }

    public User login(String rawEmail, String rawPassword) {
        String email = normalizeEmail(rawEmail);

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getPasswordHash() == null) {
            throw new InvalidCredentialsException("Incorrect email or password");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Incorrect email or password");
        }

        return user;
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
