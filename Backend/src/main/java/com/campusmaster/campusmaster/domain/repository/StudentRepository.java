package com.campusmaster.campusmaster.domain.repository;

import com.campusmaster.campusmaster.domain.model.user.Student;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository {
    Optional<Student> findByINE(String INE);

    Optional<Student> findByEmail(String email);

    boolean existsByINE(String INE);

    Boolean existsByEmail(String email);

    Student save(Student student);

    Optional<Student> findById(Long id);

    java.util.List<Student> findByValidated(boolean validated);

    void deleteById(Long id);
}
