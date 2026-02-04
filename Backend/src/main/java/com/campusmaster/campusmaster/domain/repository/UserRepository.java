package com.campusmaster.campusmaster.domain.repository;

import com.campusmaster.campusmaster.domain.model.user.Role;
import com.campusmaster.campusmaster.domain.model.user.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository {
    boolean existsById(Long id);
    Optional<User> findByEmail(String email);

    User save(User user);

    boolean existsByEmail(String email);

    Optional<User> findById(Long id);

    List<User> findAll();

    Page<User> findAll(Pageable pageable);

    void deleteById(Long id);

    boolean existsByRole(Role role);

    long countByRole(Role role);

    List<User> findAllByRole(Role role);

    Page<User> findAllByRole(Role role, Pageable pageable);
}
