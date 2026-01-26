package com.campusmaster.campusmaster.infrastructure.persistence.pedagogy;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.repository.DepartmentRepository;

public interface DepartmentJpaRepository extends JpaRepository<Department, Long>, DepartmentRepository {
    boolean existsByCode(String code);
    Department save(Department department);
    Optional<Department> findById(Long id);
}
