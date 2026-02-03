package com.campusmaster.campusmaster.domain.repository;

import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByCode(String code);

    Optional<Department> findByCode(String code);
}
