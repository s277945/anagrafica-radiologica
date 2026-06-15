package com.anagrafica.radiologica.unit;

import com.anagrafica.radiologica.api.model.ApparecchiaturaRequest;
import com.anagrafica.radiologica.api.model.ApparecchiaturaResponse;
import com.anagrafica.radiologica.entity.*;
import com.anagrafica.radiologica.exception.*;
import com.anagrafica.radiologica.mapper.EntityMapper;
import com.anagrafica.radiologica.repository.*;
import com.anagrafica.radiologica.service.ApparecchiaturaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApparecchiaturaServiceTest {

    @Mock
    private ApparecchiaturaRepository apparecchiaturaRepository;
    @Mock
    private OrganizzazioneRepository organizzazioneRepository;
    @Mock
    private ContenitoreRepository contenitoreRepository;
    @Spy
    private EntityMapper mapper;

    @InjectMocks
    private ApparecchiaturaService service;

    private Organizzazione organizzazione;
    private Contenitore contenitore;

    @BeforeEach
    void setUp() {
        organizzazione = Organizzazione.builder().id(1L).nome("ASL Roma 1").build();
        contenitore = Contenitore.builder().id(10L).nome("Edificio A").organizzazione(organizzazione).build();
    }

    @Test
    @DisplayName("Crea apparecchiatura con successo")
    void create_success() {
        ApparecchiaturaRequest request = buildRequest("TAC Siemens", "SN-001", LocalDate.of(2024, 1, 15));

        when(apparecchiaturaRepository.findByNumeroDiSerie("SN-001")).thenReturn(Optional.empty());
        when(organizzazioneRepository.findById(1L)).thenReturn(Optional.of(organizzazione));
        when(contenitoreRepository.findById(10L)).thenReturn(Optional.of(contenitore));
        when(apparecchiaturaRepository.save(any())).thenAnswer(inv -> {
            Apparecchiatura a = inv.getArgument(0);
            a.setId(100L);
            return a;
        });

        ApparecchiaturaResponse result = service.create(request);

        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getNome()).isEqualTo("TAC Siemens");
        assertThat(result.getTipologia()).isEqualTo("TAC");
        verify(apparecchiaturaRepository).save(any());
    }

    @Test
    @DisplayName("Rifiuta seriale duplicato con HTTP 409")
    void create_duplicateSerial_throwsException() {
        ApparecchiaturaRequest request = buildRequest("TAC Siemens", "SN-DUP", LocalDate.of(2024, 1, 15));
        when(apparecchiaturaRepository.findByNumeroDiSerie("SN-DUP"))
            .thenReturn(Optional.of(new Apparecchiatura()));

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(DuplicateSerialNumberException.class)
            .hasMessageContaining("SN-DUP");
    }

    @Test
    @DisplayName("Rifiuta data di installazione futura")
    void create_futureDate_throwsException() {
        ApparecchiaturaRequest request = buildRequest("RX Mobile", "SN-FUT", LocalDate.now().plusDays(30));

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(BusinessValidationException.class)
            .hasMessageContaining("futuro");
    }

    @Test
    @DisplayName("Rifiuta organizzazione inesistente")
    void create_orgNotFound_throwsException() {
        ApparecchiaturaRequest request = buildRequest("TAC", "SN-X", LocalDate.of(2024, 1, 1));
        when(apparecchiaturaRepository.findByNumeroDiSerie("SN-X")).thenReturn(Optional.empty());
        when(organizzazioneRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Rifiuta contenitore di organizzazione diversa")
    void create_contenitoreMismatch_throwsException() {
        ApparecchiaturaRequest request = buildRequest("TAC", "SN-MIS", LocalDate.of(2024, 1, 1));
        Organizzazione otherOrg = Organizzazione.builder().id(99L).nome("Altra").build();
        Contenitore otherContenitore = Contenitore.builder().id(10L).nome("X").organizzazione(otherOrg).build();

        when(apparecchiaturaRepository.findByNumeroDiSerie("SN-MIS")).thenReturn(Optional.empty());
        when(organizzazioneRepository.findById(1L)).thenReturn(Optional.of(organizzazione));
        when(contenitoreRepository.findById(10L)).thenReturn(Optional.of(otherContenitore));

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(BusinessValidationException.class)
            .hasMessageContaining("non appartiene");
    }

    private ApparecchiaturaRequest buildRequest(String nome, String seriale, LocalDate data) {
        ApparecchiaturaRequest req = new ApparecchiaturaRequest();
        req.setNome(nome);
        req.setTipologia(ApparecchiaturaRequest.TipologiaEnum.TAC);
        req.setNumeroDiSerie(seriale);
        req.setDataInstallazione(data);
        req.setOrganizzazioneId(1L);
        req.setContenitoreId(10L);
        return req;
    }
}
