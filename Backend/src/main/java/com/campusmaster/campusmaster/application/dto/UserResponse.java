package com.campusmaster.campusmaster.application.dto;

import java.sql.Date;

import com.campusmaster.campusmaster.domain.model.user.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String avatarUrl;
    private Role role;
    private Boolean enabled;
    
    // Champs spécifiques pour Student
    private Date dateOfBirth;
    private Long departmentId;
    private String departmentName;
    private String gender;
    private Boolean validated;
    private String ine;
}
