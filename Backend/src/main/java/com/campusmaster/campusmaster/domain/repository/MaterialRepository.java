package com.campusmaster.campusmaster.domain.repository;

import com.campusmaster.campusmaster.domain.model.course.Material;
import com.campusmaster.campusmaster.domain.model.course.MaterialType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    List<Material> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    List<Material> findByCourseIdAndTypeOrderByCreatedAtDesc(Long courseId, MaterialType type);

    List<Material> findByCourseIdAndVisibleOrderByCreatedAtDesc(Long courseId, Boolean visible);

    Long countByCourseId(Long courseId);
}
