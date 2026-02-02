package com.campusmaster.campusmaster.infrastructure.persistence.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.repository.TeacherRepository;

public interface TeacherJpaRepository extends JpaRepository<Teacher, Long>, TeacherRepository {
    Teacher save(Teacher teacher);
    Optional<Teacher> findById(Long id);
    List<Teacher> findAll();
    void deleteById(Long id);
    boolean existsById(Long id);
    List<Teacher> findAllById(Iterable<Long> ids);
}
