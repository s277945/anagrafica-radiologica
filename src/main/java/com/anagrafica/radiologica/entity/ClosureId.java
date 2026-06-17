package com.anagrafica.radiologica.entity;

import lombok.*;
import java.io.Serializable;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class ClosureId implements Serializable {
    private String ancestorId;
    private String descendantId;
}
