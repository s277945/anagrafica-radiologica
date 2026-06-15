package com.anagrafica.radiologica.controller;

import com.anagrafica.radiologica.api.OrganizzazioniApi;
import com.anagrafica.radiologica.api.model.OrganizzazioneTree;
import com.anagrafica.radiologica.service.OrganizzazioneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class OrganizzazioneController implements OrganizzazioniApi {

    private final OrganizzazioneService service;

    @Override
    public ResponseEntity<OrganizzazioneTree> getOrganizzazioneTree(Long id) {
        OrganizzazioneTree tree = service.getTree(id);
        return ResponseEntity.ok(tree);
    }
}
