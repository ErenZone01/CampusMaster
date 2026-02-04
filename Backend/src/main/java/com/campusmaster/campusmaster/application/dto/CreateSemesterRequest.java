package com.campusmaster.campusmaster.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateSemesterRequest {

    @NotBlank(message = "Le nom du semestre est requis")
    private String name;

    @NotBlank(message = "Le code du semestre est requis")
    private String code;

    @NotNull(message = "La date de début est requise") private LocalDate startDate;

    @NotNull(message = "La date de fin est requise") private LocalDate endDate;
}
