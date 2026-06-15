package com.anagrafica.radiologica.repository;

import com.anagrafica.radiologica.entity.Apparecchiatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApparecchiaturaRepository extends JpaRepository<Apparecchiatura, Long> {
    Optional<Apparecchiatura> findByNumeroDiSerie(String numeroDiSerie);
    List<Apparecchiatura> findByOrganizzazioneIdAndContenitoreIsNull(Long organizzazioneId);
    List<Apparecchiatura> findByContenitoreId(Long contenitoreId);
}
