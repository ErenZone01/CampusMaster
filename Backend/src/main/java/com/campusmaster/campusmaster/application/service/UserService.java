package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.domain.model.user.User;
import java.util.List;

public interface UserService {
    User createUser(User user);

    User getUserById(Long id);

    List<User> getAllUsers();

    void deleteUser(Long id);
}
