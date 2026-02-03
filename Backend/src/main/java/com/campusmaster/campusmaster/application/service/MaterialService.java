package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.application.dto.CreateMaterialRequest;
import com.campusmaster.campusmaster.application.dto.MaterialResponse;
import com.campusmaster.campusmaster.application.dto.UpdateMaterialRequest;
import com.campusmaster.campusmaster.domain.model.course.MaterialType;
import java.util.List;

public interface MaterialService {

    MaterialResponse createMaterial(CreateMaterialRequest request);

    MaterialResponse updateMaterial(Long id, UpdateMaterialRequest request);

    void deleteMaterial(Long id);

    MaterialResponse getMaterialById(Long id);

    List<MaterialResponse> getMaterialsByCourseId(Long courseId);

    List<MaterialResponse> getMaterialsByCourseIdAndType(Long courseId, MaterialType type);

    MaterialResponse toggleVisibility(Long id);
}
