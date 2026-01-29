package com.campusmaster.campusmaster.infrastructure.persistence.user;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusmaster.campusmaster.domain.model.user.Admin;

public interface AdminJpaRepository extends JpaRepository<Admin, Long> {

}
