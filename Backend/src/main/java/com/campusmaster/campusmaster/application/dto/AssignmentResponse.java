package com.campusmaster.campusmaster.application.dto;

import java.time.LocalDateTime;


import jakarta.validation.constraints.NotBlank;
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
public class AssignmentResponse {
    @NotBlank
    private Long id;
    @NotBlank
    private String title;
    @NotBlank
    private String description;
    @NotBlank
    private String instruction;
    @NotBlank
    private LocalDateTime deadline;
    @NotBlank
    private Long courseId;
    @NotBlank
    private boolean published;
}
