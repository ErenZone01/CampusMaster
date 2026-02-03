package com.campusmaster.campusmaster.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateAssignmentRequest {

    @NotBlank(message = "Le titre est requis")
    private String title;

    private String instructions; // Optionnel

    @NotNull(message = "La date limite est requise") private LocalDateTime dueDate;

    @NotNull(message = "Le cours est requis") private Long courseId;

    private String filePath; // Optional document attachment
}
