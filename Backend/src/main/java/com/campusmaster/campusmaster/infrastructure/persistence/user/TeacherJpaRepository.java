package com.campusmaster.campusmaster.infrastructure.persistence.user;

import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.repository.TeacherRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherJpaRepository extends JpaRepository<Teacher, Long>, TeacherRepository {}
