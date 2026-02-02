package com.campusmaster.campusmaster.application.dto;

import java.sql.Date;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    @Email
    private String email;
    private String firstName;
    private String lastName;
    private Boolean enabled;
    private String role;  // ADMIN, TEACHER, STUDENT
    
    // Champs spécifiques pour Student
    private Date dateOfBirth;
    private Long departmentId;
    private String gender;
    private Boolean validated;
}
