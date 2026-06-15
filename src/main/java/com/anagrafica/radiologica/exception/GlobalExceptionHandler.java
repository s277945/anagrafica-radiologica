package com.anagrafica.radiologica.exception;

import com.anagrafica.radiologica.api.model.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.OffsetDateTime;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        logger.info("Risorsa non trovata: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse();
        error.setTimestamp(OffsetDateTime.now());
        error.setStatus(404);
        error.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(DuplicateSerialNumberException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateSerialNumberException ex) {
        logger.info("Seriale duplicato: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse();
        error.setTimestamp(OffsetDateTime.now());
        error.setStatus(409);
        error.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(BusinessValidationException.class)
    public ResponseEntity<ErrorResponse> handleBusinessValidation(BusinessValidationException ex) {
        logger.info("Validazione business fallita: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse();
        error.setTimestamp(OffsetDateTime.now());
        error.setStatus(400);
        error.setMessage(ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
            .toList();
        logger.info("Validazione fallita: {}", details);
        ErrorResponse error = new ErrorResponse();
        error.setTimestamp(OffsetDateTime.now());
        error.setStatus(400);
        error.setMessage("Validazione fallita");
        error.setDetails(details);
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        logger.error("Errore non gestito", ex);
        ErrorResponse error = new ErrorResponse();
        error.setTimestamp(OffsetDateTime.now());
        error.setStatus(500);
        error.setMessage("Errore interno del server");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
