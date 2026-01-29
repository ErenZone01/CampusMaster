package com.campusmaster.campusmaster.application.dto;

import java.util.Date;

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
public class StudentResponse {
    private String email;
    private String firstName;
    private String lastName;
    private String gender;
    private String INE;
    private String department_code;
    private Date dateOfBirth;
    private Boolean validated;
}
