package com.campusmaster.campusmaster.infrastructure.persistence.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campusmaster.campusmaster.domain.model.user.Role;
import com.campusmaster.campusmaster.domain.model.user.User;
import com.campusmaster.campusmaster.domain.repository.UserRepository;

// Cette interface étend JpaRepository et implémente UserRepository pour relier les deux
@Repository
public interface UserJpaRepository extends JpaRepository<User, Long>, UserRepository {
    // Spring Data JPA crée automatiquement la requête
    boolean existsById(Long id);
    Optional<User> findByEmail(String email);
    User save(User user);
    boolean existsByEmail(String email);
    Optional<User> findById(Long id);
    List<User> findAll();
    void deleteById(Long id);
    boolean existsByRole(Role role);

}
