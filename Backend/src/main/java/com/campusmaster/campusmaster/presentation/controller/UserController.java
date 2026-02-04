package com.campusmaster.campusmaster.presentation.controller;

import com.campusmaster.campusmaster.application.dto.CreateUserRequest;
import com.campusmaster.campusmaster.application.dto.UpdateUserRequest;
import com.campusmaster.campusmaster.application.dto.UserResponse;
import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.model.user.Admin;
import com.campusmaster.campusmaster.domain.model.user.Role;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.model.user.User;
import com.campusmaster.campusmaster.domain.repository.DepartmentRepository;
import com.campusmaster.campusmaster.domain.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
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
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Gestion des utilisateurs")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer utilisateur", description = "Créer un nouvel utilisateur")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        }

        User user;
        switch (request.getRole()) {
            case ADMIN:
                Admin admin = new Admin();
                admin.setAccess_Level("FULL");
                user = admin;
                break;
            case TEACHER:
                Teacher teacher = new Teacher();
                teacher.setDepartment("Non assigné");
                user = teacher;
                break;
            case STUDENT:
                if (request.getDateOfBirth() == null) {
                    throw new IllegalArgumentException(
                            "La date de naissance est obligatoire pour un étudiant");
                }
                if (request.getDepartmentId() == null) {
                    throw new IllegalArgumentException(
                            "Le département est obligatoire pour un étudiant");
                }
                if (request.getGender() == null || request.getGender().isEmpty()) {
                    throw new IllegalArgumentException("Le genre est obligatoire pour un étudiant");
                }

                Department department =
                        departmentRepository
                                .findById(request.getDepartmentId())
                                .orElseThrow(
                                        () ->
                                                new IllegalArgumentException(
                                                        "Département non trouvé"));

                Student student = new Student();
                student.setDateOfBirth(request.getDateOfBirth());
                student.setDepartment(department);
                student.setGender(request.getGender());
                student.setValidated(true); // Validé par défaut quand créé par un admin

                // Générer un INE unique
                String ine;
                do {
                    ine = "INE" + System.currentTimeMillis();
                } while (userRepository.existsByEmail(ine)); // Simple vérification d'unicité
                student.setINE(ine);

                user = student;
                break;
            default:
                throw new IllegalArgumentException("Rôle invalide");
        }

        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setEnabled(true);

        userRepository.save(user);

        UserResponse response =
                UserResponse.builder()
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole())
                        .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Liste des utilisateurs",
            description = "Récupérer tous les utilisateurs avec pagination et filtres")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<User> users;

        if (role != null && !role.isEmpty()) {
            Role roleEnum = Role.valueOf(role.toUpperCase());
            users = userRepository.findAllByRole(roleEnum, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        Page<UserResponse> response =
                users.map(
                        user ->
                                UserResponse.builder()
                                        .id(user.getId())
                                        .email(user.getEmail())
                                        .firstName(user.getFirstName())
                                        .lastName(user.getLastName())
                                        .avatarUrl(user.getAvatarUrl())
                                        .avatarUrl(user.getAvatarUrl())
                                        .role(user.getRole())
                                        .build());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(#id, authentication)")
    @Operation(
            summary = "Détails utilisateur",
            description = "Récupérer les informations d'un utilisateur par son ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        UserResponse.UserResponseBuilder responseBuilder =
                UserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole())
                        .enabled(user.isEnabled());

        // Ajouter les champs spécifiques pour Student
        if (user instanceof Student) {
            Student student = (Student) user;
            responseBuilder
                    .dateOfBirth(student.getDateOfBirth())
                    .departmentId(student.getDepartment().getId())
                    .departmentName(student.getDepartment().getName())
                    .gender(student.getGender())
                    .validated(student.isValidated())
                    .ine(student.getINE());
        }

        return ResponseEntity.ok(responseBuilder.build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(#id, authentication)")
    @Operation(
            summary = "Modifier utilisateur",
            description = "Mettre à jour les informations d'un utilisateur")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {

        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        // Mise à jour des champs spécifiques pour Student
        if (user instanceof Student) {
            Student student = (Student) user;

            if (request.getDateOfBirth() != null) {
                student.setDateOfBirth(request.getDateOfBirth());
            }
            if (request.getDepartmentId() != null) {
                Department department =
                        departmentRepository
                                .findById(request.getDepartmentId())
                                .orElseThrow(
                                        () ->
                                                new IllegalArgumentException(
                                                        "Département non trouvé"));
                student.setDepartment(department);
            }
            if (request.getGender() != null) {
                student.setGender(request.getGender());
            }
            if (request.getValidated() != null) {
                student.setValidated(request.getValidated());
            }
        }

        userRepository.save(user);

        UserResponse response =
                UserResponse.builder()
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .role(user.getRole())
                        .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Supprimer utilisateur",
            description = "Désactiver un utilisateur (soft delete)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user =
                userRepository
                        .findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        user.setEnabled(false);
        userRepository.save(user);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Liste des étudiants", description = "Récupérer tous les étudiants")
    public ResponseEntity<List<UserResponse>> getStudents() {
        List<User> students = userRepository.findAllByRole(Role.STUDENT);

        List<UserResponse> response =
                students.stream()
                        .map(
                                user ->
                                        UserResponse.builder()
                                                .id(user.getId())
                                                .email(user.getEmail())
                                                .firstName(user.getFirstName())
                                                .lastName(user.getLastName())
                                                .role(user.getRole())
                                                .build())
                        .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/teachers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Liste des enseignants", description = "Récupérer tous les enseignants")
    public ResponseEntity<List<UserResponse>> getTeachers() {
        List<User> teachers = userRepository.findAllByRole(Role.TEACHER);

        List<UserResponse> response =
                teachers.stream()
                        .map(
                                user ->
                                        UserResponse.builder()
                                                .id(user.getId())
                                                .email(user.getEmail())
                                                .firstName(user.getFirstName())
                                                .lastName(user.getLastName())
                                                .role(user.getRole())
                                                .build())
                        .toList();

        return ResponseEntity.ok(response);
    }
}
