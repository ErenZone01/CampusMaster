package com.campusmaster.campusmaster.application.dto;

import com.campusmaster.campusmaster.domain.model.course.MaterialType;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MaterialResponse {

    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private MaterialType type;
    private String fileUrl;
    private String externalUrl;
    private Long fileSize;

    @JsonProperty("isVisible")
    private Boolean visible;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
