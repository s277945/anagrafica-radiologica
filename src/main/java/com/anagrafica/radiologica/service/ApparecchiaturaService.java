package com.anagrafica.radiologica.service;

import com.anagrafica.radiologica.api.model.ApparecchiaturaRequest;
import com.anagrafica.radiologica.api.model.ApparecchiaturaResponse;
import com.anagrafica.radiologica.entity.*;
import com.anagrafica.radiologica.exception.*;
import com.anagrafica.radiologica.mapper.EntityMapper;
import com.anagrafica.radiologica.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ApparecchiaturaService {

    private static final Logger logger = LoggerFactory.getLogger(ApparecchiaturaService.class);

    private final ApparecchiaturaRepository apparecchiaturaRepository;
    private final OrganizzazioneRepository organizzazioneRepository;
    private final ContenitoreRepository contenitoreRepository;
    private final EntityMapper mapper;

    @Transactional
    public ApparecchiaturaResponse create(ApparecchiaturaRequest request) {
        logger.info("Creazione apparecchiatura: {}", request.getNome());
        logger.debug("Request completa: {}", request);

        // Validazione data futura
        if (request.getDataInstallazione() != null && request.getDataInstallazione().isAfter(LocalDate.now())) {
            throw new BusinessValidationException("La data di installazione non può essere nel futuro");
        }

        // Validazione seriale duplicato
        apparecchiaturaRepository.findByNumeroDiSerie(request.getNumeroDiSerie())
            .ifPresent(existing -> {
                throw new DuplicateSerialNumberException(request.getNumeroDiSerie());
            });

        // Recupero organizzazione
        Organizzazione org = organizzazioneRepository.findById(request.getOrganizzazioneId())
            .orElseThrow(() -> new ResourceNotFoundException("Organizzazione", request.getOrganizzazioneId()));

        // Recupero contenitore (opzionale)
        Contenitore contenitore = null;
        if (request.getContenitoreId() != null) {
            contenitore = contenitoreRepository.findById(request.getContenitoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Contenitore", request.getContenitoreId()));

            // Validazione coerenza: il contenitore deve appartenere alla stessa organizzazione
            if (!contenitore.getOrganizzazione().getId().equals(org.getId())) {
                throw new BusinessValidationException(
                    "Il contenitore " + contenitore.getId() + " non appartiene all'organizzazione " + org.getId());
            }
        }

        Apparecchiatura entity = Apparecchiatura.builder()
            .nome(request.getNome())
            .tipologia(Tipologia.valueOf(request.getTipologia().name()))
            .numeroDiSerie(request.getNumeroDiSerie())
            .dataInstallazione(request.getDataInstallazione())
            .organizzazione(org)
            .contenitore(contenitore)
            .build();

        Apparecchiatura saved = apparecchiaturaRepository.save(entity);
        logger.info("Apparecchiatura creata con ID: {}", saved.getId());

        return mapper.toResponse(saved);
    }
}
