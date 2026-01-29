package com.campusmaster.campusmaster.application.service;

import java.util.List;

import com.campusmaster.campusmaster.application.dto.CreateModuleRequest;
import com.campusmaster.campusmaster.application.dto.ModuleResponse;
import com.campusmaster.campusmaster.application.dto.DepartmentResponse;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;

public interface ModuleService {
    ModuleResponse createModule(CreateModuleRequest module);

    ModuleResponse updateModule(Long id, CreateModuleRequest module);

    ModuleResponse getModuleById(Long id);

    List<ModuleResponse> getAllModules();

    List<ModuleResponse> getModulesBySemester(Semester semester);

    List<ModuleResponse> getModulesByDepartment(Long departmentId);

    void deleteModule(Long id);
}
