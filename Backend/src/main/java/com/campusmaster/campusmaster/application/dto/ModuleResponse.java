package com.campusmaster.campusmaster.application.dto;

import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;
import java.util.List;
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
public class ModuleResponse {
    private Long id;
    private String name;
    private String code;
    private Semester semester;
    private Long departmentId;
    private String departmentName;
    private List<Long> teacherIds;
}
