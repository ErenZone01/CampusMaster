package com.campusmaster.campusmaster.presentation.controller;

import java.time.LocalDate;
import java.util.List;

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

import com.campusmaster.campusmaster.application.dto.CreateSemesterRequest;
import com.campusmaster.campusmaster.application.dto.UpdateSemesterRequest;
import com.campusmaster.campusmaster.domain.model.pedagogy.AcademicSemester;
import com.campusmaster.campusmaster.domain.repository.AcademicSemesterRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/semesters")
@Tag(name = "Semesters", description = "Gestion des semestres académiques")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class SemesterController {

    private final AcademicSemesterRepository semesterRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Liste des semestres", description = "Récupérer tous les semestres")
    public ResponseEntity<List<AcademicSemester>> getAllSemesters() {
        return ResponseEntity.ok(semesterRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Détails d'un semestre", description = "Récupérer un semestre par son ID")
    public ResponseEntity<AcademicSemester> getSemesterById(@PathVariable Long id) {
        return semesterRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Semestre actuel", description = "Récupérer le semestre actuellement actif")
    public ResponseEntity<AcademicSemester> getCurrentSemester() {
        return semesterRepository.findByIsCurrent(true)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un semestre", description = "Créer un nouveau semestre académique (Admin uniquement)")
    public ResponseEntity<?> createSemester(@Valid @RequestBody CreateSemesterRequest request) {
        // Vérifier si le code existe déjà
        if (semesterRepository.existsByCode(request.getCode())) {
            return ResponseEntity.badRequest().body("Un semestre avec ce code existe déjà");
        }

        // Vérifier que la date de fin est après la date de début
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            return ResponseEntity.badRequest().body("La date de fin doit être après la date de début");
        }

        AcademicSemester semester = AcademicSemester.builder()
                .name(request.getName())
                .code(request.getCode())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(false)
                .build();

        AcademicSemester savedSemester = semesterRepository.save(semester);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSemester);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Modifier un semestre", description = "Modifier un semestre existant (Admin uniquement)")
    public ResponseEntity<?> updateSemester(@PathVariable Long id, @Valid @RequestBody UpdateSemesterRequest request) {
        return semesterRepository.findById(id)
                .map(semester -> {
                    // Vérifier si le nouveau code existe déjà (pour un autre semestre)
                    if (request.getCode() != null && !semester.getCode().equals(request.getCode()) 
                            && semesterRepository.existsByCode(request.getCode())) {
                        return ResponseEntity.badRequest().body("Un semestre avec ce code existe déjà");
                    }

                    // Vérifier les dates si elles sont fournies
                    LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : semester.getStartDate();
                    LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : semester.getEndDate();
                    
                    if (!endDate.isAfter(startDate)) {
                        return ResponseEntity.badRequest().body("La date de fin doit être après la date de début");
                    }

                    // Si on veut définir ce semestre comme actuel, désactiver tous les autres
                    if (request.getIsCurrent() != null && request.getIsCurrent()) {
                        semesterRepository.findByIsCurrent(true).ifPresent(currentSemester -> {
                            currentSemester.setIsCurrent(false);
                            semesterRepository.save(currentSemester);
                        });
                    }

                    // Mettre à jour les champs
                    if (request.getName() != null) {
                        semester.setName(request.getName());
                    }
                    if (request.getCode() != null) {
                        semester.setCode(request.getCode());
                    }
                    if (request.getStartDate() != null) {
                        semester.setStartDate(request.getStartDate());
                    }
                    if (request.getEndDate() != null) {
                        semester.setEndDate(request.getEndDate());
                    }
                    if (request.getIsCurrent() != null) {
                        semester.setIsCurrent(request.getIsCurrent());
                    }

                    AcademicSemester updatedSemester = semesterRepository.save(semester);
                    return ResponseEntity.ok(updatedSemester);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un semestre", description = "Supprimer un semestre (Admin uniquement)")
    public ResponseEntity<?> deleteSemester(@PathVariable Long id) {
        return semesterRepository.findById(id)
                .map(semester -> {
                    semesterRepository.delete(semester);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/set-current")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Définir comme semestre actuel", description = "Définir un semestre comme étant le semestre actuel")
    public ResponseEntity<?> setCurrentSemester(@PathVariable Long id) {
        return semesterRepository.findById(id)
                .map(semester -> {
                    // Désactiver tous les autres semestres
                    semesterRepository.findByIsCurrent(true).ifPresent(currentSemester -> {
                        currentSemester.setIsCurrent(false);
                        semesterRepository.save(currentSemester);
                    });

                    // Activer ce semestre
                    semester.setIsCurrent(true);
                    AcademicSemester updatedSemester = semesterRepository.save(semester);
                    return ResponseEntity.ok(updatedSemester);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
