package com.campusmaster.campusmaster.application.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateAssignmentRequest {

    private String title;

    private String instructions;

    private LocalDateTime dueDate;

    private String filePath;
}
