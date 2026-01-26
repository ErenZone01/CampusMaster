package com.campusmaster.campusmaster.infrastructure.persistence.pedagogy;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.campusmaster.campusmaster.domain.model.pedagogy.Module;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;
import com.campusmaster.campusmaster.domain.repository.ModuleRepository;

public interface ModuleJpaRepository extends JpaRepository<Module, Long>, ModuleRepository {
    Optional<Module> findById(Long id);

    List<Module> findAll();

    Module save(Module module);

    boolean existsByCode(String code);

    List<Module> findBySemester(Semester semester);

    List<Module> findByDepartmentId(Long departmentId);

    Optional<Module> findByCode(String code);

    void deleteById(Long id);
}
