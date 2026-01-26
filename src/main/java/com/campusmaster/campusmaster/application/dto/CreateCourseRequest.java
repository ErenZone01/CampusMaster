package com.campusmaster.campusmaster.application.dto;

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
public class CreateCourseRequest {
    private String title;
    private String description;
    private Long moduleId;
    private Long teacherId;
}
