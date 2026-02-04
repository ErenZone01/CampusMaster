package com.campusmaster.campusmaster.domain.repository;

import com.campusmaster.campusmaster.domain.model.pedagogy.Module;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;
import java.util.List;
import java.util.Optional;

public interface ModuleRepository {
    Optional<Module> findById(Long id);

    List<Module> findAll();

    Module save(Module module);

    boolean existsByCode(String code);

    List<Module> findBySemester(Semester semester);

    List<Module> findByDepartmentId(Long departmentId);

    Optional<Module> findByCode(String code);

    void deleteById(Long id);
}
