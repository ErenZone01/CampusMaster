package com.campusmaster.campusmaster.application.dto;

import com.campusmaster.campusmaster.domain.model.course.CourseStatus;
import jakarta.validation.constraints.Min;
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
public class CreateCourseRequest {

    @NotBlank(message = "Le code du cours est requis")
    private String code;

    @NotBlank(message = "Le titre du cours est requis")
    private String title;

    private String description;

    @NotNull(message = "Le nombre de crédits est requis") @Min(value = 1, message = "Le cours doit avoir au moins 1 crédit")
    private Integer credits;

    private Integer maxStudents;

    private String coverImage;

    @NotNull(message = "Le département est requis") private Long departmentId;

    @NotNull(message = "Le semestre est requis") private Long semesterId;

    @NotNull(message = "L'enseignant est requis") private Long teacherId;

    @Builder.Default private CourseStatus status = CourseStatus.DRAFT;
}
