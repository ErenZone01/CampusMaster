package com.campusmaster.campusmaster.application.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateSemesterRequest {

    private String name;
    private String code;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCurrent;
}
