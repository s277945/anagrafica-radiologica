package com.anagrafica.radiologica.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contenitori_closure")
@IdClass(ClosureId.class)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ContenitoreClosure {

    @Id
    @Column(name = "ancestor_id")
    private Long ancestorId;

    @Id
    @Column(name = "descendant_id")
    private Long descendantId;

    @Column(nullable = false)
    private int depth;
}
