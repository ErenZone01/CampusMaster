package com.campusmaster.campusmaster.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.campusmaster.campusmaster.domain.model.user.Role;
import com.campusmaster.campusmaster.domain.model.user.User;

@Repository
public interface UserRepository {
    Optional<User> findByEmail(String email);
    User save(User user);
    boolean existsByEmail(String email);
    Optional<User> findById(Long id);
    List<User> findAll();
    void deleteById(Long id);
    boolean existsByRole(Role role);
}
