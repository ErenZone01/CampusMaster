package com.campusmaster.campusmaster.domain.repository;

import java.util.Optional;

import com.campusmaster.campusmaster.domain.model.pedagogy.Department;

public interface DepartmentRepository {
    boolean existsByCode(String code);
    Department save(Department department);
    Optional<Department> findById(Long id);
    Optional<Department> findByCode(String code);
}
