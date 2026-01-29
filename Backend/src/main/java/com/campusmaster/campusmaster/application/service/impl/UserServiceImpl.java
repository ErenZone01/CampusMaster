package com.campusmaster.campusmaster.application.service.impl;


import java.util.List;

import org.springframework.stereotype.Service;

import com.campusmaster.campusmaster.application.service.UserService;
import com.campusmaster.campusmaster.domain.model.user.User;
import com.campusmaster.campusmaster.domain.repository.UserRepository;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
