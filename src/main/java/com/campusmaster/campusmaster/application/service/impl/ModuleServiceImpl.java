package com.campusmaster.campusmaster.application.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campusmaster.campusmaster.domain.repository.DepartmentRepository;
import com.campusmaster.campusmaster.domain.repository.ModuleRepository;
import com.campusmaster.campusmaster.domain.repository.TeacherRepository;
import com.campusmaster.campusmaster.application.dto.CreateModuleRequest;
import com.campusmaster.campusmaster.application.service.ModuleService;
import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.model.pedagogy.Module;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;
import com.campusmaster.campusmaster.domain.model.user.Teacher;

@Service
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final TeacherRepository teacherRepository;
    private final DepartmentRepository departmentRepository;

    public ModuleServiceImpl(ModuleRepository moduleRepository, TeacherRepository teacherRepository, DepartmentRepository departmentRepository) {
        this.moduleRepository = moduleRepository;
        this.teacherRepository = teacherRepository;
        this.departmentRepository = departmentRepository;
    }


    @Override
    public Module createModule(CreateModuleRequest request) {

        if (moduleRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Module with code " + request.getCode() + " already exists");
        }

        if (departmentRepository.findByCode(request.getDepartment()) == null) {
            throw new RuntimeException("Department not found with code " + request.getDepartment());
        }

        List<Teacher> teachers = new ArrayList<>();

        if (!teacherRepository.findAllById(request.getTeachers()).isEmpty()) {
            teachers = teacherRepository.findAllById(request.getTeachers());
        } 

        Department department = departmentRepository.findByCode(request.getDepartment()).get();

        Module module = Module.builder()
                .name(request.getName())
                .code(request.getCode())
                .semester(request.getSemester())
                .department(department)
                .teachers(teachers)
                .build();

        return moduleRepository.save(module);
    }


    @Override
    public Module updateModule(Long id, CreateModuleRequest module) {
        Module existingModule = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found"));

        if (departmentRepository.findByCode(module.getDepartment()) == null) {
            throw new RuntimeException("Department not found with code " + module.getDepartment());
        }

        if (teacherRepository.findAllById(module.getTeachers()).size() != module.getTeachers().size()) {
            throw new RuntimeException("One or more teachers not found with the given ids");
        }

        Department department = departmentRepository.findByCode(module.getDepartment()).get();
        List<Teacher> teachers = teacherRepository.findAllById(module.getTeachers());

        existingModule.setName(module.getName());
        existingModule.setCode(module.getCode());
        existingModule.setSemester(module.getSemester());
        existingModule.setDepartment(department);
        existingModule.setTeachers(teachers);

        return moduleRepository.save(existingModule);
    }


    @Override
    public Module getModuleById(Long id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found"));
        return module;
    }


    @Override
    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }


    @Override
    public List<Module> getModulesBySemester(Semester semester) {
        if(moduleRepository.findBySemester(semester).isEmpty()) {
            throw new RuntimeException("No modules found for the given semester");
        }
        return moduleRepository.findBySemester(semester);
    }


    @Override
    public List<Module> getModulesByDepartment(Long departmentId) {
        if(moduleRepository.findByDepartmentId(departmentId).isEmpty()) {
            throw new RuntimeException("No modules found for the given department");
        }
        return moduleRepository.findByDepartmentId(departmentId);
    }


    @Override
    public void deleteModule(Long id) {
        if(!moduleRepository.findById(id).isPresent()) {
            throw new RuntimeException("Module not found");
        }
        moduleRepository.deleteById(id);
    }

}
