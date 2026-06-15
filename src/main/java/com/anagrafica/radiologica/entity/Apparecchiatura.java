package com.anagrafica.radiologica.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "apparecchiature")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Apparecchiatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tipologia tipologia;

    @Column(name = "numero_di_serie", nullable = false, unique = true)
    private String numeroDiSerie;

    @Column(name = "data_installazione", nullable = false)
    private LocalDate dataInstallazione;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizzazione_id", nullable = false)
    private Organizzazione organizzazione;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contenitore_id")
    private Contenitore contenitore;
}
