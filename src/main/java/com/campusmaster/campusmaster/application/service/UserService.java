package com.campusmaster.campusmaster.application.service;

import java.util.List;

import com.campusmaster.campusmaster.domain.model.user.User;

public interface UserService {
    User createUser(User user);
    User getUserById(Long id);
    List<User> getAllUsers();
    void deleteUser(Long id);
}
