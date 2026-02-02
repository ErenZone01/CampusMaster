package com.campusmaster.campusmaster.application.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubmissionResponse {
    private Long id;
    private String filename;
    private String filepath;
    private String filetype;
    private LocalDateTime submittedAt;
    private Double grade;
    private String feedback;
    private Long assignmentId;
    private Long studentId;
}
