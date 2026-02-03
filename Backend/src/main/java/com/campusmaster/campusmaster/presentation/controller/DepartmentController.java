package com.campusmaster.campusmaster.presentation.controller;

import com.campusmaster.campusmaster.application.dto.CreateDepartmentRequest;
import com.campusmaster.campusmaster.application.dto.UpdateDepartmentRequest;
import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.repository.DepartmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/departments")
@Tag(name = "Departments", description = "Gestion des départements")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Liste des départements", description = "Récupérer tous les départements")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(
            summary = "Détails d'un département",
            description = "Récupérer un département par son ID")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        return departmentRepository
                .findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Créer un département",
            description = "Créer un nouveau département (Admin uniquement)")
    public ResponseEntity<?> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        // Vérifier si le code ou le nom existe déjà
        if (departmentRepository.existsByCode(request.getCode())) {
            return ResponseEntity.badRequest().body("Un département avec ce code existe déjà");
        }

        Department department =
                Department.builder().name(request.getName()).code(request.getCode()).build();

        Department savedDepartment = departmentRepository.save(department);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDepartment);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Modifier un département",
            description = "Modifier un département existant (Admin uniquement)")
    public ResponseEntity<?> updateDepartment(
            @PathVariable Long id, @Valid @RequestBody UpdateDepartmentRequest request) {
        return departmentRepository
                .findById(id)
                .map(
                        department -> {
                            // Vérifier si le nouveau code existe déjà (pour un autre département)
                            if (!department.getCode().equals(request.getCode())
                                    && departmentRepository.existsByCode(request.getCode())) {
                                return ResponseEntity.badRequest()
                                        .body("Un département avec ce code existe déjà");
                            }

                            department.setName(request.getName());
                            department.setCode(request.getCode());
                            Department updatedDepartment = departmentRepository.save(department);
                            return ResponseEntity.ok(updatedDepartment);
                        })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Supprimer un département",
            description = "Supprimer un département (Admin uniquement)")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        return departmentRepository
                .findById(id)
                .map(
                        department -> {
                            departmentRepository.delete(department);
                            return ResponseEntity.ok().build();
                        })
                .orElse(ResponseEntity.notFound().build());
    }
}
