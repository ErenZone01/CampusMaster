package com.campusmaster.campusmaster.presentation.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusmaster.campusmaster.application.dto.CreateDepartmentRequest;
import com.campusmaster.campusmaster.application.dto.CreateModuleRequest;
import com.campusmaster.campusmaster.application.dto.CreateTeacherRequest;
import com.campusmaster.campusmaster.application.service.AdminService;
import com.campusmaster.campusmaster.application.service.DepartmentService;
import com.campusmaster.campusmaster.application.service.ModuleService;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.model.pedagogy.Module;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin")
public class AdminController {
    
    @Autowired
    private AdminService adminService;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private ModuleService moduleService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create/teachers")
    public ResponseEntity<Teacher> createTeacher(
            @Valid @RequestBody CreateTeacherRequest request) {

        Teacher teacher = adminService.createTeacher(request);
        return new ResponseEntity<>(teacher, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create/departments")
    public void createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        departmentService.createDepartment(request);
    }

     @PreAuthorize("hasRole('ADMIN')")
     @PostMapping("/create/modules")
     public void createModule(@Valid @RequestBody CreateModuleRequest request) {
         moduleService.createModule(request);
     }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/modules")
    public ResponseEntity<List<Module>> getAllModules() {
        return ResponseEntity.ok(moduleService.getAllModules());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/modules/{id}")
    public ResponseEntity<Module> getModuleById(@PathVariable Long id) {
        return ResponseEntity.ok(moduleService.getModuleById(id));
    }

    @GetMapping("/semester/{semester}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Module>> getBySemester(@PathVariable Semester semester) {
        return ResponseEntity.ok(moduleService.getModulesBySemester(semester));
    }

    @GetMapping("/departments/{departmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Module>> getByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(moduleService.getModulesByDepartment(departmentId));
    }

    @DeleteMapping("/modules/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteModule(@PathVariable Long id) {
        moduleService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }

}
