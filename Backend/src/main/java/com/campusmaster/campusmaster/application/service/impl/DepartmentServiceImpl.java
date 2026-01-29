package com.campusmaster.campusmaster.application.service.impl;

import org.springframework.stereotype.Service;

import com.campusmaster.campusmaster.application.dto.CreateDepartmentRequest;
import com.campusmaster.campusmaster.application.dto.DepartmentResponse;
import com.campusmaster.campusmaster.application.service.DepartmentService;
import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.repository.DepartmentRepository;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public DepartmentResponse createDepartment(CreateDepartmentRequest request) {
        if (departmentRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Department code already exists");
        }

        Department department = Department.builder()
                .name(request.getName())
                .code(request.getCode())
                .build();
        Department saved = departmentRepository.save(department);
        return DepartmentResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .code(saved.getCode())
                .build();
    }

}