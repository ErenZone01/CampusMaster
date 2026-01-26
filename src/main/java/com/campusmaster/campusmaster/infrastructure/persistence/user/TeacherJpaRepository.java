package com.campusmaster.campusmaster.infrastructure.persistence.user;

import org.springframework.data.jpa.repository.JpaRepository;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.repository.TeacherRepository;

public interface TeacherJpaRepository extends JpaRepository<Teacher, Long>, TeacherRepository {

}
