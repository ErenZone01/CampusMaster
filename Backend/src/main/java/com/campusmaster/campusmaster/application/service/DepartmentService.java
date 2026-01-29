package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.application.dto.CreateDepartmentRequest;
import com.campusmaster.campusmaster.application.dto.DepartmentResponse;

public interface DepartmentService {
    DepartmentResponse createDepartment(CreateDepartmentRequest request);
}
