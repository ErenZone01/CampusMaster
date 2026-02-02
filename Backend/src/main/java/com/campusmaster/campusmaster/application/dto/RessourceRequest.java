package com.campusmaster.campusmaster.application.dto;


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
public class RessourceRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String filename;
    @NotNull
    private String fileType;
    @NotBlank
    private String filepath;
    @NotBlank
    private Long courseId;
}
