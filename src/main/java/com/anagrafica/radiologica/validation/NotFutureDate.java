package com.anagrafica.radiologica.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NotFutureDateValidator.class)
@Documented
public @interface NotFutureDate {
    String message() default "La data non può essere nel futuro";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
