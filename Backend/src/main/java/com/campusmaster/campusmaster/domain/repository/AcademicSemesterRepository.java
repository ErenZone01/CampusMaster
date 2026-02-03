package com.campusmaster.campusmaster.domain.repository;

import com.campusmaster.campusmaster.domain.model.pedagogy.AcademicSemester;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AcademicSemesterRepository extends JpaRepository<AcademicSemester, Long> {

    boolean existsByCode(String code);

    Optional<AcademicSemester> findByCode(String code);

    Optional<AcademicSemester> findByIsCurrent(Boolean isCurrent);
}
