package com.campusmaster.campusmaster.application.dto;

import java.time.LocalDateTime;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class RessourceResponse {
    @NotBlank
    private Long Id;
    @NotBlank
    private String title;
    @NotBlank
    private String filename;
    @NotBlank
    private String filetype;
    @NotBlank
    private String filepath;
    @NotBlank
    private LocalDateTime uploadedAt;
    @NotNull
    private Long courseId;
}
