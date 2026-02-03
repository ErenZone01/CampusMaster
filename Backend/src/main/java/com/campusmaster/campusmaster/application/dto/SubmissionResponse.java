package com.campusmaster.campusmaster.application.dto;

import java.time.LocalDateTime;

import com.campusmaster.campusmaster.domain.model.assigment.Submission;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionResponse {
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String filePath;
    private LocalDateTime submittedAt;
    private Double grade;
    private String feedback;
    private Boolean isLate;
    private Long courseId;
    private String courseCode;

    public static SubmissionResponse fromEntity(Submission submission) {
        LocalDateTime dueDate = submission.getAssignment().getDueDate();
        boolean isLate = submission.getSubmittedAt().isAfter(dueDate);
        
        return SubmissionResponse.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment().getId())
                .assignmentTitle(submission.getAssignment().getTitle())
                .studentId(submission.getStudent().getId())
                .studentName(submission.getStudent().getFirstName() + " " + submission.getStudent().getLastName())
                .studentEmail(submission.getStudent().getEmail())
                .filePath(submission.getFilePath())
                .submittedAt(submission.getSubmittedAt())
                .grade(submission.getGrade())
                .feedback(submission.getFeedback())
                .isLate(isLate)
                .courseId(submission.getAssignment().getCourse().getId())
                .courseCode(submission.getAssignment().getCourse().getCode())
                .build();
    }
}
