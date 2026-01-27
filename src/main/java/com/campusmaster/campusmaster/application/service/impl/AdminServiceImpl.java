package com.campusmaster.campusmaster.application.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.campusmaster.campusmaster.application.dto.CreateTeacherRequest;
import com.campusmaster.campusmaster.application.service.AdminService;
import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.model.user.Role;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.repository.DepartmentRepository;
import com.campusmaster.campusmaster.domain.repository.ModuleRepository;
import com.campusmaster.campusmaster.domain.repository.TeacherRepository;
import com.campusmaster.campusmaster.domain.repository.UserRepository;
import com.campusmaster.campusmaster.domain.model.pedagogy.Module;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ModuleRepository moduleRepository;
    @Autowired
    private DepartmentRepository departmentRepository;
    

    @Override
    public Teacher createTeacher(CreateTeacherRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already used");
        }

        Teacher teacher = new Teacher();
        teacher.setFirstName(request.getFirstName());
        teacher.setLastName(request.getLastName());
        teacher.setEmail(request.getEmail());
        teacher.setPassword(passwordEncoder.encode(request.getPassword()));
        teacher.setRole(Role.TEACHER);
        teacher.setEnabled(true);
        teacher.setDepartment(request.getDepartment());

        return teacherRepository.save(teacher);
    }
}
