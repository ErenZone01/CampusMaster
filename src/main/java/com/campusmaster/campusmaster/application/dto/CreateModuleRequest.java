package com.campusmaster.campusmaster.application.dto;

import java.util.List;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;

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
public class CreateModuleRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String code;
    @NotBlank
    private Semester semester;
    @NotBlank
    private Long department;

    private List<Long> teachers;
}
