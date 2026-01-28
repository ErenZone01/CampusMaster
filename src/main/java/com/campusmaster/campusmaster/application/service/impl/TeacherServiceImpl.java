package com.campusmaster.campusmaster.application.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.campusmaster.campusmaster.application.dto.StudentResponse;
import com.campusmaster.campusmaster.application.service.TeacherService;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.repository.StudentRepository;

@Service
public class TeacherServiceImpl implements TeacherService {

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public StudentResponse validateStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        student.setValidated(true);

        studentRepository.save(student);

        return StudentResponse.builder()
                .email(student.getEmail())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .INE(student.getINE())
                .dateOfBirth(student.getDateOfBirth())
                .department_code(student.getDepartment().getCode())
                .validated(student.isValidated())
                .build();
    }



  
}

