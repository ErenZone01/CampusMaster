package com.campusmaster.campusmaster.application.dto;

import com.campusmaster.campusmaster.domain.model.course.MaterialType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateMaterialRequest {

    @NotNull(message = "Course ID is required") private Long courseId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Type is required") private MaterialType type;

    private String fileUrl;

    private String externalUrl;

    private Long fileSize;

    @Builder.Default private Boolean visible = true;
}
