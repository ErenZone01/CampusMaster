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
import com.campusmaster.campusmaster.application.dto.ModuleResponse;
import com.campusmaster.campusmaster.application.dto.DepartmentResponse;
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
    public ModuleResponse createModule(CreateModuleRequest request) {

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

        Module saved = moduleRepository.save(module);
        return ModuleResponse.builder()
            .id(saved.getId())
            .name(saved.getName())
            .code(saved.getCode())
            .semester(saved.getSemester())
            .departmentId(saved.getDepartment() != null ? saved.getDepartment().getId() : null)
            .departmentName(saved.getDepartment() != null ? saved.getDepartment().getName() : null)
            .teacherIds(saved.getTeachers() != null ? saved.getTeachers().stream().map(t -> t.getId()).toList() : List.of())
            .build();
    }


    @Override
    public ModuleResponse updateModule(Long id, CreateModuleRequest module) {
        Module existingModule = moduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Module not found"));

        if (!departmentRepository.existsByCode(module.getDepartment())) {
            throw new RuntimeException("Department not found with code " + module.getDepartment());
        }
        if (module.getSemester() != Semester.SEMESTER_1 && module.getSemester() != Semester.SEMESTER_2){
            throw new RuntimeException("Semestre is not registered ");
        }
        
        Department department = departmentRepository.findByCode(module.getDepartment()).get();
        List<Teacher> teacher = teacherRepository.findAllById(module.getTeachers());

        existingModule.setName(module.getName());
        existingModule.setCode(module.getCode());
        existingModule.setSemester(module.getSemester());
        existingModule.setDepartment(department);
        existingModule.setTeachers(teacher);

        Module saved = moduleRepository.save(existingModule);
        return ModuleResponse.builder()
            .id(saved.getId())
            .name(saved.getName())
            .code(saved.getCode())
            .semester(saved.getSemester())
            .departmentId(saved.getDepartment() != null ? saved.getDepartment().getId() : null)
            .departmentName(saved.getDepartment() != null ? saved.getDepartment().getName() : null)
            .teacherIds(saved.getTeachers() != null ? saved.getTeachers().stream().map(t -> t.getId()).toList() : List.of())
            .build();
    }


    @Override
        public ModuleResponse getModuleById(Long id) {
        Module module = moduleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Module not found"));
        return ModuleResponse.builder()
            .id(module.getId())
            .name(module.getName())
            .code(module.getCode())
            .semester(module.getSemester())
            .departmentId(module.getDepartment() != null ? module.getDepartment().getId() : null)
            .departmentName(module.getDepartment() != null ? module.getDepartment().getName() : null)
            .teacherIds(module.getTeachers() != null ? module.getTeachers().stream().map(t -> t.getId()).toList() : List.of())
            .build();
        }


    @Override
    public List<ModuleResponse> getAllModules() {
        return moduleRepository.findAll().stream().map(m -> ModuleResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .code(m.getCode())
                .semester(m.getSemester())
                .departmentId(m.getDepartment() != null ? m.getDepartment().getId() : null)
                .departmentName(m.getDepartment() != null ? m.getDepartment().getName() : null)
                .teacherIds(m.getTeachers() != null ? m.getTeachers().stream().map(t -> t.getId()).toList() : List.of())
                .build()).toList();
    }


    @Override
    public List<ModuleResponse> getModulesBySemester(Semester semester) {
        if(moduleRepository.findBySemester(semester).isEmpty()) {
            throw new RuntimeException("No modules found for the given semester");
        }
        return moduleRepository.findBySemester(semester).stream().map(m -> ModuleResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .code(m.getCode())
                .semester(m.getSemester())
                .departmentId(m.getDepartment() != null ? m.getDepartment().getId() : null)
                .departmentName(m.getDepartment() != null ? m.getDepartment().getName() : null)
                .teacherIds(m.getTeachers() != null ? m.getTeachers().stream().map(t -> t.getId()).toList() : List.of())
                .build()).toList();
    }


    @Override
    public List<ModuleResponse> getModulesByDepartment(Long departmentId) {
        if(moduleRepository.findByDepartmentId(departmentId).isEmpty()) {
            throw new RuntimeException("No modules found for the given department");
        }
        return moduleRepository.findByDepartmentId(departmentId).stream().map(m -> ModuleResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .code(m.getCode())
                .semester(m.getSemester())
                .departmentId(m.getDepartment() != null ? m.getDepartment().getId() : null)
                .departmentName(m.getDepartment() != null ? m.getDepartment().getName() : null)
                .teacherIds(m.getTeachers() != null ? m.getTeachers().stream().map(t -> t.getId()).toList() : List.of())
                .build()).toList();
    }


    @Override
    public void deleteModule(Long id) {
        if(!moduleRepository.findById(id).isPresent()) {
            throw new RuntimeException("Module not found");
        }
        moduleRepository.deleteById(id);
    }

}
