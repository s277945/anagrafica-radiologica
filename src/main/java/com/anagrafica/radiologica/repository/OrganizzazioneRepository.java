package com.anagrafica.radiologica.repository;

import com.anagrafica.radiologica.entity.Organizzazione;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizzazioneRepository extends JpaRepository<Organizzazione, String> {
}
