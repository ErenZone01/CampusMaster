package com.campusmaster.campusmaster.infrastructure.bootstrap;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.course.CourseStatus;
import com.campusmaster.campusmaster.domain.model.pedagogy.AcademicSemester;
import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.model.user.Admin;
import com.campusmaster.campusmaster.domain.model.user.Role;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.repository.AcademicSemesterRepository;
import com.campusmaster.campusmaster.domain.repository.CourseRepository;
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
    private final AcademicSemesterRepository semesterRepository;
    private final CourseRepository courseRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeDepartments();
        initializeAdmin();
        initializeTeachers();
        initializeCourses();
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

    private void initializeTeachers() {
        long teacherCount = userRepository.countByRole(Role.TEACHER);
        
        if (teacherCount == 0) {
            // Récupérer les départements
            Department info = departmentRepository.findByCode("INFO").orElse(null);
            Department math = departmentRepository.findByCode("MATH").orElse(null);
            Department phys = departmentRepository.findByCode("PHYS").orElse(null);

            // Enseignant 1 - Informatique
            Teacher teacher1 = new Teacher();
            teacher1.setFirstName("Mamadou");
            teacher1.setLastName("Diop");
            teacher1.setEmail("mamadou.diop@campusmaster.com");
            teacher1.setPassword(passwordEncoder.encode("teacher123"));
            teacher1.setRole(Role.TEACHER);
            teacher1.setEnabled(true);
            if (info != null) teacher1.setDepartment(info.getCode());
            userRepository.save(teacher1);

            // Enseignant 2 - Mathématiques
            Teacher teacher2 = new Teacher();
            teacher2.setFirstName("Fatou");
            teacher2.setLastName("Seck");
            teacher2.setEmail("fatou.seck@campusmaster.com");
            teacher2.setPassword(passwordEncoder.encode("teacher123"));
            teacher2.setRole(Role.TEACHER);
            teacher2.setEnabled(true);
            if (math != null) teacher2.setDepartment(math.getCode());
            userRepository.save(teacher2);

            // Enseignant 3 - Physique
            Teacher teacher3 = new Teacher();
            teacher3.setFirstName("Ousmane");
            teacher3.setLastName("Ndiaye");
            teacher3.setEmail("ousmane.ndiaye@campusmaster.com");
            teacher3.setPassword(passwordEncoder.encode("teacher123"));
            teacher3.setRole(Role.TEACHER);
            teacher3.setEnabled(true);
            if (phys != null) teacher3.setDepartment(phys.getCode());
            userRepository.save(teacher3);

            log.info("✅ 3 enseignants par défaut créés (mot de passe: teacher123)");
        } else {
            log.info("ℹ️ Enseignants déjà existants, initialisation ignorée");
        }
    }

    private void initializeCourses() {
        if (courseRepository.count() == 0) {
            log.info("🚀 Initialisation des cours de démonstration...");

            // Récupérer les départements existants
            Department info = departmentRepository.findByCode("INFO").orElse(null);
            Department math = departmentRepository.findByCode("MATH").orElse(null);
            Department phys = departmentRepository.findByCode("PHYS").orElse(null);
            Department gest = departmentRepository.findByCode("GEST").orElse(null);

            // Récupérer le semestre actuel ou le premier disponible
            AcademicSemester currentSemester = semesterRepository.findByIsCurrent(true)
                .or(() -> semesterRepository.findAll().stream().findFirst())
                .orElse(null);

            if (currentSemester == null) {
                log.warn("⚠️ Aucun semestre disponible, impossible de créer des cours");
                return;
            }

            // Récupérer quelques enseignants
            List<Teacher> teachers = userRepository.findAllByRole(Role.TEACHER).stream()
                .filter(u -> u instanceof Teacher)
                .map(u -> (Teacher) u)
                .limit(5)
                .toList();

            if (teachers.isEmpty()) {
                log.warn("⚠️ Aucun enseignant disponible, impossible de créer des cours");
                return;
            }

            Teacher teacher1 = teachers.get(0);
            Teacher teacher2 = teachers.size() > 1 ? teachers.get(1) : teacher1;
            Teacher teacher3 = teachers.size() > 2 ? teachers.get(2) : teacher1;
            Teacher teacher4 = teachers.size() > 3 ? teachers.get(3) : teacher1;

            // Créer des cours de démonstration
            if (info != null) {
                Course programmation = Course.builder()
                    .code("INFO101")
                    .title("Programmation Java")
                    .description("Introduction à la programmation orientée objet avec Java")
                    .credits(6)
                    .maxStudents(30)
                    .status(CourseStatus.PUBLISHED)
                    .department(info)
                    .semester(currentSemester)
                    .teacher(teacher1)
                    .build();
                courseRepository.save(programmation);

                Course web = Course.builder()
                    .code("INFO201")
                    .title("Développement Web")
                    .description("HTML, CSS, JavaScript et frameworks modernes")
                    .credits(5)
                    .maxStudents(25)
                    .status(CourseStatus.PUBLISHED)
                    .department(info)
                    .semester(currentSemester)
                    .teacher(teacher2)
                    .build();
                courseRepository.save(web);

                Course bdd = Course.builder()
                    .code("INFO301")
                    .title("Bases de Données")
                    .description("Conception et gestion de bases de données relationnelles")
                    .credits(4)
                    .maxStudents(30)
                    .status(CourseStatus.PUBLISHED)
                    .department(info)
                    .semester(currentSemester)
                    .teacher(teacher3)
                    .build();
                courseRepository.save(bdd);
            }

            if (math != null) {
                Course algebre = Course.builder()
                    .code("MATH101")
                    .title("Algèbre Linéaire")
                    .description("Espaces vectoriels, matrices et transformations linéaires")
                    .credits(6)
                    .maxStudents(40)
                    .status(CourseStatus.PUBLISHED)
                    .department(math)
                    .semester(currentSemester)
                    .teacher(teacher2)
                    .build();
                courseRepository.save(algebre);

                Course analyse = Course.builder()
                    .code("MATH201")
                    .title("Analyse Mathématique")
                    .description("Suites, séries, intégrales et dérivées")
                    .credits(5)
                    .maxStudents(35)
                    .status(CourseStatus.PUBLISHED)
                    .department(math)
                    .semester(currentSemester)
                    .teacher(teacher1)
                    .build();
                courseRepository.save(analyse);
            }

            if (phys != null) {
                Course mecanique = Course.builder()
                    .code("PHYS101")
                    .title("Mécanique Classique")
                    .description("Cinématique, dynamique et lois de Newton")
                    .credits(5)
                    .maxStudents(30)
                    .status(CourseStatus.PUBLISHED)
                    .department(phys)
                    .semester(currentSemester)
                    .teacher(teacher4)
                    .build();
                courseRepository.save(mecanique);
            }

            if (gest != null) {
                Course compta = Course.builder()
                    .code("GEST101")
                    .title("Comptabilité Générale")
                    .description("Principes de base de la comptabilité")
                    .credits(4)
                    .maxStudents(40)
                    .status(CourseStatus.PUBLISHED)
                    .department(gest)
                    .semester(currentSemester)
                    .teacher(teacher3)
                    .build();
                courseRepository.save(compta);

                Course management = Course.builder()
                    .code("GEST201")
                    .title("Management d'Équipe")
                    .description("Leadership et gestion des ressources humaines")
                    .credits(3)
                    .maxStudents(25)
                    .status(CourseStatus.DRAFT)
                    .department(gest)
                    .semester(currentSemester)
                    .teacher(teacher4)
                    .build();
                courseRepository.save(management);
            }

            log.info("✅ {} cours de démonstration créés", courseRepository.count());
        } else {
            log.info("ℹ️ Cours déjà existants, initialisation ignorée");
        }
    }
}
