package com.anagrafica.radiologica.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, String id) {
        super(resource + " con id " + id + " non trovata");
    }
}
