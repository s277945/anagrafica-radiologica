package com.anagrafica.radiologica.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;

public class NotFutureDateValidator implements ConstraintValidator<NotFutureDate, LocalDate> {

    @Override
    public boolean isValid(LocalDate value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // null check delegated to @NotNull
        }
        return !value.isAfter(LocalDate.now());
    }
}
