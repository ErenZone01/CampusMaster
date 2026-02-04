package com.campusmaster.campusmaster.domain.repository;

import com.campusmaster.campusmaster.domain.model.user.Teacher;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherRepository {
    Teacher save(Teacher teacher);

    Optional<Teacher> findById(Long id);

    List<Teacher> findAll();

    void deleteById(Long id);

    boolean existsById(Long id);

    List<Teacher> findAllById(Iterable<Long> ids);
}
