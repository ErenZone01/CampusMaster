package com.campusmaster.campusmaster.infrastructure.persistence.user;

import com.campusmaster.campusmaster.domain.model.user.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminJpaRepository extends JpaRepository<Admin, Long> {}
