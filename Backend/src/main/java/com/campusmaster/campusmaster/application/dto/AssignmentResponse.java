package com.campusmaster.campusmaster.application.dto;

import java.time.LocalDateTime;

import com.campusmaster.campusmaster.domain.model.assigment.Assignment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssignmentResponse {
    private Long id;
    private String title;
    private String instructions;
    private LocalDateTime dueDate;
    private Long courseId;
    private String courseCode;
    private String courseTitle;
    private Long teacherId;
    private String teacherName;
    private Integer submissionCount;
    private Integer pendingSubmissions;
    private LocalDateTime createdAt;

    public static AssignmentResponse fromEntity(Assignment assignment) {
        return AssignmentResponse.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .instructions(assignment.getInstructions())
                .dueDate(assignment.getDueDate())
                .courseId(assignment.getCourse().getId())
                .courseCode(assignment.getCourse().getCode())
                .courseTitle(assignment.getCourse().getTitle())
                .teacherId(assignment.getTeacher().getId())
                .teacherName(assignment.getTeacher().getFirstName() + " " + assignment.getTeacher().getLastName())
                .submissionCount(assignment.getSubmissions() != null ? assignment.getSubmissions().size() : 0)
                .pendingSubmissions(assignment.getSubmissions() != null 
                    ? (int) assignment.getSubmissions().stream().filter(s -> s.getGrade() == null).count() 
                    : 0)
                .build();
    }
}
