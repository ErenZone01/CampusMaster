package com.campusmaster.campusmaster.infrastructure.bootstrap;

import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.course.CourseStatus;
import com.campusmaster.campusmaster.domain.model.pedagogy.AcademicSemester;
import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.model.user.Admin;
import com.campusmaster.campusmaster.domain.model.user.Role;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.repository.AcademicSemesterRepository;
import com.campusmaster.campusmaster.domain.repository.CourseRepository;
import com.campusmaster.campusmaster.domain.repository.DepartmentRepository;
import com.campusmaster.campusmaster.domain.repository.StudentRepository;
import com.campusmaster.campusmaster.domain.repository.UserRepository;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicSemesterRepository semesterRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeDepartments();
        initializeSemesters();
        initializeAdmin();
        initializeTeachers();
        initializeStudents();
        initializeCourses();
    }

    private void initializeSemesters() {
        if (semesterRepository.count() == 0) {
            // Semestre actuel (2025-2026 S1)
            AcademicSemester semester1 =
                    AcademicSemester.builder()
                            .name("Semestre 1 - 2025/2026")
                            .code("S1-2025-2026")
                            .startDate(LocalDate.of(2025, 9, 1))
                            .endDate(LocalDate.of(2026, 1, 31))
                            .isCurrent(true)
                            .build();
            semesterRepository.save(semester1);

            // Semestre suivant (2025-2026 S2)
            AcademicSemester semester2 =
                    AcademicSemester.builder()
                            .name("Semestre 2 - 2025/2026")
                            .code("S2-2025-2026")
                            .startDate(LocalDate.of(2026, 2, 1))
                            .endDate(LocalDate.of(2026, 6, 30))
                            .isCurrent(false)
                            .build();
            semesterRepository.save(semester2);

            log.info("✅ 2 semestres par défaut créés");
        } else {
            log.info("ℹ️ Semestres déjà existants, initialisation ignorée");
        }
    }

    private void initializeDepartments() {
        if (departmentRepository.count() == 0) {
            Department informatique =
                    Department.builder().name("Informatique").code("INFO").build();

            Department mathematiques =
                    Department.builder().name("Mathématiques").code("MATH").build();

            Department physique = Department.builder().name("Physique").code("PHYS").build();

            Department gestion = Department.builder().name("Gestion").code("GEST").build();

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

    private void initializeStudents() {
        long studentCount = userRepository.countByRole(Role.STUDENT);

        if (studentCount == 0) {
            Department info = departmentRepository.findByCode("INFO").orElse(null);
            if (info == null) {
                log.warn("⚠️ Département INFO non trouvé, impossible de créer l'étudiant");
                return;
            }

            Student student = new Student();
            student.setFirstName("Étudiant");
            student.setLastName("Test");
            student.setEmail("student@campusmaster.com");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setRole(Role.STUDENT);
            student.setEnabled(true);
            student.setValidated(true);
            student.setDepartment(info);
            student.setGender("M");
            student.setDateOfBirth(java.sql.Date.valueOf("2000-01-15"));
            student.setINE("INE" + System.currentTimeMillis());

            studentRepository.save(student);
            log.info("✅ Étudiant par défaut créé: student@campusmaster.com / student123");
        } else {
            log.info("ℹ️ Étudiants déjà existants, initialisation ignorée");
        }
    }

    private void initializeCourses() {
        if (courseRepository.count() == 0) {
            log.info("🚀 Initialisation des cours par défaut...");

            // Récupérer le département INFO
            Department info = departmentRepository.findByCode("INFO").orElse(null);
            if (info == null) {
                log.warn("⚠️ Département INFO non trouvé, impossible de créer des cours");
                return;
            }

            // Récupérer le semestre actuel ou le premier disponible
            AcademicSemester currentSemester =
                    semesterRepository
                            .findByIsCurrent(true)
                            .or(() -> semesterRepository.findAll().stream().findFirst())
                            .orElse(null);

            if (currentSemester == null) {
                log.warn("⚠️ Aucun semestre disponible, impossible de créer des cours");
                return;
            }

            // Récupérer un enseignant
            Teacher teacher =
                    userRepository.findAllByRole(Role.TEACHER).stream()
                            .filter(u -> u instanceof Teacher)
                            .map(u -> (Teacher) u)
                            .findFirst()
                            .orElse(null);

            if (teacher == null) {
                log.warn("⚠️ Aucun enseignant disponible, impossible de créer des cours");
                return;
            }

            // Cours 1 - Programmation Java
            Course cours1 =
                    Course.builder()
                            .code("INFO101")
                            .title("Programmation Java")
                            .description("Introduction à la programmation orientée objet avec Java")
                            .credits(6)
                            .maxStudents(30)
                            .status(CourseStatus.PUBLISHED)
                            .department(info)
                            .semester(currentSemester)
                            .teacher(teacher)
                            .build();
            courseRepository.save(cours1);

            // Cours 2 - Développement Web
            Course cours2 =
                    Course.builder()
                            .code("INFO201")
                            .title("Développement Web")
                            .description("HTML, CSS, JavaScript et frameworks modernes")
                            .credits(5)
                            .maxStudents(25)
                            .status(CourseStatus.PUBLISHED)
                            .department(info)
                            .semester(currentSemester)
                            .teacher(teacher)
                            .build();
            courseRepository.save(cours2);

            // Cours 3 - Bases de Données
            Course cours3 =
                    Course.builder()
                            .code("INFO301")
                            .title("Bases de Données")
                            .description("Conception et gestion de bases de données relationnelles")
                            .credits(4)
                            .maxStudents(30)
                            .status(CourseStatus.PUBLISHED)
                            .department(info)
                            .semester(currentSemester)
                            .teacher(teacher)
                            .build();
            courseRepository.save(cours3);

            log.info("✅ 3 cours par défaut créés");
        } else {
            log.info("ℹ️ Cours déjà existants, initialisation ignorée");
        }
    }
}
