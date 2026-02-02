package com.campusmaster.campusmaster.infrastructure.persistence.pedagogy;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.repository.DepartmentRepository;

public interface DepartmentJpaRepository extends DepartmentRepository {
    boolean existsByCode(String code);
    @Override
    Department save(Department department);
    @Override
    Optional<Department> findById(Long id);
}
