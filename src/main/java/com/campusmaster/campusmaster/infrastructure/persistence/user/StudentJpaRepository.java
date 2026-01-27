package com.campusmaster.campusmaster.infrastructure.persistence.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.repository.StudentRepository;

public interface StudentJpaRepository extends JpaRepository<Student, Long>, StudentRepository {
    Optional<Student> findByINE(String INE);
        boolean existsByINE(String INE);
        Optional<Student> existsByEmail(String email);
        Student save(Student student);
        Optional<Student> findById(Long id);
        void deleteById(Long id);
}