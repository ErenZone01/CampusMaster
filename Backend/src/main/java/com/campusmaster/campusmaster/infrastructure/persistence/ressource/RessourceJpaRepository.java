package com.campusmaster.campusmaster.infrastructure.persistence.ressource;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusmaster.campusmaster.domain.model.ressource.Ressource;
import com.campusmaster.campusmaster.domain.repository.RessourceRepository;

public interface RessourceJpaRepository extends JpaRepository<Ressource, Long> ,RessourceRepository {
    Ressource save(Ressource ressource);
    Optional<Ressource> findById(Long id);
    void deleteById(Long id);
    boolean existsById(Long id);
}
