package com.anagrafica.radiologica.controller;

import com.anagrafica.radiologica.api.ApparecchiatureApi;
import com.anagrafica.radiologica.api.model.ApparecchiaturaRequest;
import com.anagrafica.radiologica.api.model.ApparecchiaturaResponse;
import com.anagrafica.radiologica.service.ApparecchiaturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ApparecchiaturaController implements ApparecchiatureApi {

    private final ApparecchiaturaService service;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApparecchiaturaResponse> createApparecchiatura(ApparecchiaturaRequest request) {
        ApparecchiaturaResponse response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
