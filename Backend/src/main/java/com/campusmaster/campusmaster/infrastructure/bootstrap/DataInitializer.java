package com.campusmaster.campusmaster.infrastructure.bootstrap;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.model.user.Admin;
import com.campusmaster.campusmaster.domain.model.user.Role;
import com.campusmaster.campusmaster.domain.repository.DepartmentRepository;
import com.campusmaster.campusmaster.domain.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeDepartments();
        initializeAdmin();
    }

    private void initializeDepartments() {
        if (departmentRepository.count() == 0) {
            Department informatique = Department.builder()
                .name("Informatique")
                .code("INFO")
                .build();
            
            Department mathematiques = Department.builder()
                .name("Mathématiques")
                .code("MATH")
                .build();
            
            Department physique = Department.builder()
                .name("Physique")
                .code("PHYS")
                .build();
            
            Department gestion = Department.builder()
                .name("Gestion")
                .code("GEST")
                .build();
            
            departmentRepository.save(informatique);
            departmentRepository.save(mathematiques);
            departmentRepository.save(physique);
            departmentRepository.save(gestion);
            
            log.info("✅ Départements par défaut créés");
        } else {
            log.info("ℹ️ Départements déjà existants, initialisation ignorée");
        }
    }

    private void initializeAdmin() {
        long adminCount = userRepository.countByRole(Role.ADMIN);
        
        if (adminCount == 0) {
            Admin admin = new Admin();
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setEmail("admin@campusmaster.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            admin.setAccess_Level("SUPER_ADMIN");
            
            userRepository.save(admin);
            log.info("✅ Admin par défaut créé: admin@campusmaster.com / admin123");
        } else {
            log.info("ℹ️ Admin déjà existant, initialisation ignorée");
        }
    }
}
