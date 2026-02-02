package com.campusmaster.campusmaster.application.dto;

import java.time.LocalDateTime;

import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.course.CourseStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseResponse {
    private Long id;
    private String code;
    private String title;
    private String description;
    private Integer credits;
    private Integer maxStudents;
    private String coverImage;
    private CourseStatus status;
    private Long departmentId;
    private String departmentName;
    private Long semesterId;
    private String semesterName;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CourseResponse fromEntity(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .code(course.getCode())
                .title(course.getTitle())
                .description(course.getDescription())
                .credits(course.getCredits())
                .maxStudents(course.getMaxStudents())
                .coverImage(course.getCoverImage())
                .status(course.getStatus())
                .departmentId(course.getDepartment().getId())
                .departmentName(course.getDepartment().getName())
                .semesterId(course.getSemester().getId())
                .semesterName(course.getSemester().getName())
                .teacherId(course.getTeacher().getId())
                .teacherName(course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
}
