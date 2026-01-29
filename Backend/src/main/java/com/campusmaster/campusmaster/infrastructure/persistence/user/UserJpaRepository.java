package com.campusmaster.campusmaster.infrastructure.persistence.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campusmaster.campusmaster.domain.model.user.User;
import com.campusmaster.campusmaster.domain.repository.UserRepository;

// Cette interface étend JpaRepository et implémente UserRepository pour relier les deux
@Repository
public interface UserJpaRepository extends JpaRepository<User, Long>, UserRepository {
    // Spring Data JPA crée automatiquement la requête
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
