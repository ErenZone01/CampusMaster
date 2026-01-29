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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusmaster.campusmaster.application.dto.CreateDepartmentRequest;
import com.campusmaster.campusmaster.application.dto.CreateModuleRequest;
import com.campusmaster.campusmaster.application.dto.CreateTeacherRequest;
import com.campusmaster.campusmaster.application.dto.UserResponse;
import com.campusmaster.campusmaster.application.dto.ModuleResponse;
import com.campusmaster.campusmaster.application.dto.DepartmentResponse;
import com.campusmaster.campusmaster.application.service.AdminService;
import com.campusmaster.campusmaster.application.service.DepartmentService;
import com.campusmaster.campusmaster.application.service.ModuleService;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;

import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/admin")
@Tag(name = "Admin", description = "Administration académique")
public class AdminController {
    
    @Autowired
    private AdminService adminService;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private ModuleService moduleService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create/teachers")
    public ResponseEntity<UserResponse> createTeacher(
            @Valid @RequestBody CreateTeacherRequest request) {
        return new ResponseEntity<>(adminService.createTeacher(request), HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create/departments")
    public ResponseEntity<DepartmentResponse> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        return new ResponseEntity<>(departmentService.createDepartment(request), HttpStatus.CREATED) ;
    }

     @PreAuthorize("hasRole('ADMIN')")
     @PostMapping("/create/modules")
      public ResponseEntity<ModuleResponse> createModule(@Valid @RequestBody CreateModuleRequest request) {
          return new ResponseEntity<>(moduleService.createModule(request), HttpStatus.CREATED) ;
     }

     @PreAuthorize("hasRole('ADMIN')")
     @PutMapping("/modules/update/{moduleId}")
      public ResponseEntity<ModuleResponse> updateModule(@PathVariable Long moduleId ,@Valid @RequestBody CreateModuleRequest request) {
          return new ResponseEntity<>(moduleService.updateModule(moduleId, request), HttpStatus.OK);
     }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/modules")
    public ResponseEntity<List<ModuleResponse>> getAllModules() {
        return ResponseEntity.ok(moduleService.getAllModules());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/modules/{id}")
    public ResponseEntity<ModuleResponse> getModuleById(@PathVariable Long id) {
        return ResponseEntity.ok(moduleService.getModuleById(id));
    }

    @GetMapping("/semester/{semester}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ModuleResponse>> getBySemester(@PathVariable Semester semester) {
        return ResponseEntity.ok(moduleService.getModulesBySemester(semester));
    }

    @GetMapping("/departments/{departmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ModuleResponse>> getByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(moduleService.getModulesByDepartment(departmentId));
    }

    @DeleteMapping("/modules/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteModule(@PathVariable Long id) {
        moduleService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }

}
