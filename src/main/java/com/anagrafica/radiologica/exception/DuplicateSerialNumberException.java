package com.anagrafica.radiologica.exception;

public class DuplicateSerialNumberException extends RuntimeException {

    public DuplicateSerialNumberException(String serialNumber) {
        super("Numero di serie già esistente: " + serialNumber);
    }
}
