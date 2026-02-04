package com.campusmaster.campusmaster.application.service.impl;

import com.campusmaster.campusmaster.application.dto.CreateMaterialRequest;
import com.campusmaster.campusmaster.application.dto.MaterialResponse;
import com.campusmaster.campusmaster.application.dto.UpdateMaterialRequest;
import com.campusmaster.campusmaster.application.service.MaterialService;
import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.course.Material;
import com.campusmaster.campusmaster.domain.model.course.MaterialType;
import com.campusmaster.campusmaster.domain.repository.CourseRepository;
import com.campusmaster.campusmaster.domain.repository.MaterialRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final CourseRepository courseRepository;

    @Override
    public MaterialResponse createMaterial(CreateMaterialRequest request) {
        Course course =
                courseRepository
                        .findById(request.getCourseId())
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Course not found with id: "
                                                        + request.getCourseId()));

        Material material =
                Material.builder()
                        .course(course)
                        .title(request.getTitle())
                        .description(request.getDescription())
                        .type(request.getType())
                        .fileUrl(request.getFileUrl())
                        .externalUrl(request.getExternalUrl())
                        .fileSize(request.getFileSize())
                        .visible(request.getVisible() != null ? request.getVisible() : true)
                        .build();

        Material savedMaterial = materialRepository.save(material);
        return mapToResponse(savedMaterial);
    }

    @Override
    public MaterialResponse updateMaterial(Long id, UpdateMaterialRequest request) {
        Material material =
                materialRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException("Material not found with id: " + id));

        if (request.getTitle() != null) {
            material.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            material.setDescription(request.getDescription());
        }
        if (request.getType() != null) {
            material.setType(request.getType());
        }
        if (request.getFileUrl() != null) {
            material.setFileUrl(request.getFileUrl());
        }
        if (request.getExternalUrl() != null) {
            material.setExternalUrl(request.getExternalUrl());
        }
        if (request.getFileSize() != null) {
            material.setFileSize(request.getFileSize());
        }
        if (request.getVisible() != null) {
            material.setVisible(request.getVisible());
        }

        Material updatedMaterial = materialRepository.save(material);
        return mapToResponse(updatedMaterial);
    }

    @Override
    public void deleteMaterial(Long id) {
        if (!materialRepository.existsById(id)) {
            throw new RuntimeException("Material not found with id: " + id);
        }
        materialRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public MaterialResponse getMaterialById(Long id) {
        Material material =
                materialRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException("Material not found with id: " + id));
        return mapToResponse(material);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialResponse> getMaterialsByCourseId(Long courseId) {
        return materialRepository.findByCourseIdOrderByCreatedAtDesc(courseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialResponse> getMaterialsByCourseIdAndType(Long courseId, MaterialType type) {
        return materialRepository.findByCourseIdAndTypeOrderByCreatedAtDesc(courseId, type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MaterialResponse toggleVisibility(Long id) {
        Material material =
                materialRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException("Material not found with id: " + id));

        material.setVisible(!material.getVisible());
        Material updatedMaterial = materialRepository.save(material);
        return mapToResponse(updatedMaterial);
    }

    private MaterialResponse mapToResponse(Material material) {
        return MaterialResponse.builder()
                .id(material.getId())
                .courseId(material.getCourse().getId())
                .title(material.getTitle())
                .description(material.getDescription())
                .type(material.getType())
                .fileUrl(material.getFileUrl())
                .externalUrl(material.getExternalUrl())
                .fileSize(material.getFileSize())
                .visible(material.getVisible())
                .createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt())
                .build();
    }
}
