package com.anagrafica.radiologica.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "organizzazioni")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Organizzazione {

    @Id
    private String id;

    @Column(nullable = false)
    private String nome;

    @OneToMany(mappedBy = "organizzazione", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Contenitore> contenitori = new ArrayList<>();

    @OneToMany(mappedBy = "organizzazione", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Apparecchiatura> apparecchiature = new ArrayList<>();
}
