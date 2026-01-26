package com.campusmaster.campusmaster.infrastructure.persistence.user;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusmaster.campusmaster.domain.model.user.Student;

public interface StudentJpaRepository extends JpaRepository<Student, Long> {
}