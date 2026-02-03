package com.campusmaster.campusmaster.infrastructure.persistence.user;

import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.repository.StudentRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentJpaRepository extends JpaRepository<Student, Long>, StudentRepository {
    Optional<Student> findByINE(String INE);

    boolean existsByINE(String INE);

    Boolean existsByEmail(String email);

    @Override
    Student save(Student student);

    Optional<Student> findById(Long id);

    void deleteById(Long id);
}
