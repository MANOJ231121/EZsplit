package com.splitmate.service;

import com.splitmate.dto.UserDto;
import com.splitmate.exception.ResourceNotFoundException;
import com.splitmate.model.User;
import com.splitmate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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
}
