package com.campusmaster.campusmaster.application.dto;

import com.campusmaster.campusmaster.domain.model.course.CourseStatus;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateCourseRequest {

    private String code;

    private String title;

    private String description;

    @Min(value = 1, message = "Le cours doit avoir au moins 1 crédit")
    private Integer credits;

    private Integer maxStudents;

    private String coverImage;

    private Long departmentId;

    private Long semesterId;

    private Long teacherId;

    private CourseStatus status;
}
