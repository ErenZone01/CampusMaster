package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.application.dto.CreateDepartmentRequest;
import com.campusmaster.campusmaster.domain.model.pedagogy.Department;

public interface DepartmentService {
    Department createDepartment(CreateDepartmentRequest request);
}
