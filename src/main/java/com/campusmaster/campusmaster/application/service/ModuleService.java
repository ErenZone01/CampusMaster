package com.campusmaster.campusmaster.application.service;

import java.util.List;

import com.campusmaster.campusmaster.application.dto.CreateModuleRequest;
import com.campusmaster.campusmaster.domain.model.pedagogy.Module;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;

public interface ModuleService {
    Module createModule(CreateModuleRequest module);

    Module updateModule(Long id, CreateModuleRequest module);

    Module getModuleById(Long id);

    List<Module> getAllModules();

    List<Module> getModulesBySemester(Semester semester);

    List<Module> getModulesByDepartment(Long departmentId);

    void deleteModule(Long id);
}
