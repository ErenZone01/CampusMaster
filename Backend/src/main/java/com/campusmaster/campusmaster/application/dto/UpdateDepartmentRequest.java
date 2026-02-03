package com.campusmaster.campusmaster.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateDepartmentRequest {

    @NotBlank(message = "Le nom du département est requis")
    private String name;

    @NotBlank(message = "Le code du département est requis")
    private String code;
}
