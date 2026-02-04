package com.campusmaster.campusmaster.presentation.controller;

import com.campusmaster.campusmaster.application.dto.CreateMaterialRequest;
import com.campusmaster.campusmaster.application.dto.MaterialResponse;
import com.campusmaster.campusmaster.application.dto.UpdateMaterialRequest;
import com.campusmaster.campusmaster.application.service.MaterialService;
import com.campusmaster.campusmaster.domain.model.course.MaterialType;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Materials", description = "Gestion des supports de cours")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping("/courses/{courseId}/materials")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(
            summary = "Liste des supports d'un cours",
            description = "Récupérer tous les supports d'un cours")
    public ResponseEntity<List<MaterialResponse>> getCourseMaterials(
            @PathVariable Long courseId, @RequestParam(required = false) MaterialType type) {

        List<MaterialResponse> materials;
        if (type != null) {
            materials = materialService.getMaterialsByCourseIdAndType(courseId, type);
        } else {
            materials = materialService.getMaterialsByCourseId(courseId);
        }

        return ResponseEntity.ok(materials);
    }

    @GetMapping("/materials")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(
            summary = "Liste des supports par cours",
            description = "Récupérer tous les supports d'un cours")
    public ResponseEntity<List<MaterialResponse>> getMaterialsByCourse(
            @RequestParam Long courseId, @RequestParam(required = false) MaterialType type) {

        List<MaterialResponse> materials;
        if (type != null) {
            materials = materialService.getMaterialsByCourseIdAndType(courseId, type);
        } else {
            materials = materialService.getMaterialsByCourseId(courseId);
        }

        return ResponseEntity.ok(materials);
    }

    @GetMapping("/materials/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Détails d'un support", description = "Récupérer les détails d'un support")
    public ResponseEntity<MaterialResponse> getMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getMaterialById(id));
    }

    @PostMapping("/materials")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Créer un support", description = "Créer un nouveau support de cours")
    public ResponseEntity<MaterialResponse> createMaterial(
            @Valid @RequestBody CreateMaterialRequest request) {
        MaterialResponse material = materialService.createMaterial(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(material);
    }

    @PutMapping("/materials/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Modifier un support", description = "Modifier un support existant")
    public ResponseEntity<MaterialResponse> updateMaterial(
            @PathVariable Long id, @Valid @RequestBody UpdateMaterialRequest request) {
        return ResponseEntity.ok(materialService.updateMaterial(id, request));
    }

    @DeleteMapping("/materials/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Supprimer un support", description = "Supprimer un support")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/materials/{id}/toggle-visibility")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(
            summary = "Basculer la visibilité",
            description = "Rendre visible ou invisible un support")
    public ResponseEntity<MaterialResponse> toggleVisibility(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.toggleVisibility(id));
    }
}
