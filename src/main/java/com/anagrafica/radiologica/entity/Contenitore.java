package com.anagrafica.radiologica.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contenitori")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Contenitore {

    @Id
    private String id;

    @Column(nullable = false)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizzazione_id", nullable = false)
    private Organizzazione organizzazione;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Contenitore parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Contenitore> sottoContenitori = new ArrayList<>();

    @OneToMany(mappedBy = "contenitore", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Apparecchiatura> apparecchiature = new ArrayList<>();
}
