package com.anagrafica.radiologica.repository;

import com.anagrafica.radiologica.entity.Contenitore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContenitoreRepository extends JpaRepository<Contenitore, Long> {

    @Query("""
        SELECT DISTINCT c FROM Contenitore c
        LEFT JOIN FETCH c.apparecchiature
        WHERE c.organizzazione.id = :orgId
        """)
    List<Contenitore> findAllByOrganizzazioneWithApparecchiature(@Param("orgId") Long orgId);

    List<Contenitore> findByOrganizzazioneIdAndParentIsNull(Long organizzazioneId);
}
