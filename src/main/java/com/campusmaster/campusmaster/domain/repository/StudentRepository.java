package com.campusmaster.campusmaster.domain.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.campusmaster.campusmaster.domain.model.user.Student;

@Repository
public interface StudentRepository {
        Optional<Student> findByINE(String INE);
        boolean existsByINE(String INE);
        Optional<Student> existsByEmail(String email);
        Student save(Student student);
        Optional<Student> findById(Long id);
        void deleteById(Long id);
}
