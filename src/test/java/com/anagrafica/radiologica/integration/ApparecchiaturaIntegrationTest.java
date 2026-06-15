package com.anagrafica.radiologica.integration;

import com.anagrafica.radiologica.entity.*;
import com.anagrafica.radiologica.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ApparecchiaturaIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrganizzazioneRepository organizzazioneRepository;

    @Autowired
    private ContenitoreRepository contenitoreRepository;

    @Autowired
    private ApparecchiaturaRepository apparecchiaturaRepository;

    @Autowired
    private EntityManager entityManager;

    private Organizzazione org;
    private Contenitore contenitore;

    @BeforeEach
    void setUp() {
        apparecchiaturaRepository.deleteAll();
        contenitoreRepository.deleteAll();
        organizzazioneRepository.deleteAll();

        org = organizzazioneRepository.save(
            Organizzazione.builder().nome("Gruppo San Raffaele").build()
        );
        contenitore = contenitoreRepository.save(
            Contenitore.builder().nome("Edificio A").organizzazione(org).build()
        );
    }

    @Test
    @DisplayName("POST crea apparecchiatura con ruolo ADMIN")
    @WithMockUser(roles = "ADMIN")
    void createApparecchiatura_asAdmin_returns201() throws Exception {
        Map<String, Object> body = Map.of(
            "nome", "TAC Siemens Somatom",
            "tipologia", "TAC",
            "numeroDiSerie", "SN-INT-001",
            "dataInstallazione", "2024-03-15",
            "organizzazioneId", org.getId(),
            "contenitoreId", contenitore.getId()
        );

        mockMvc.perform(post("/api/apparecchiature")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.nome").value("TAC Siemens Somatom"))
            .andExpect(jsonPath("$.tipologia").value("TAC"))
            .andExpect(jsonPath("$.numeroDiSerie").value("SN-INT-001"));
    }

    @Test
    @DisplayName("POST rifiutata con ruolo USER (403)")
    @WithMockUser(roles = "USER")
    void createApparecchiatura_asUser_returns403() throws Exception {
        Map<String, Object> body = Map.of(
            "nome", "RX Portatile",
            "tipologia", "RX",
            "numeroDiSerie", "SN-INT-002",
            "dataInstallazione", "2024-01-10",
            "organizzazioneId", org.getId()
        );

        mockMvc.perform(post("/api/apparecchiature")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST seriale duplicato restituisce 409")
    @WithMockUser(roles = "ADMIN")
    void createApparecchiatura_duplicateSerial_returns409() throws Exception {
        // Salvo un'apparecchiatura
        apparecchiaturaRepository.save(Apparecchiatura.builder()
            .nome("Existing").tipologia(Tipologia.TAC).numeroDiSerie("SN-DUP-001")
            .dataInstallazione(LocalDate.of(2024, 1, 1)).organizzazione(org).build());

        Map<String, Object> body = Map.of(
            "nome", "Nuova TAC",
            "tipologia", "TAC",
            "numeroDiSerie", "SN-DUP-001",
            "dataInstallazione", "2024-06-01",
            "organizzazioneId", org.getId()
        );

        mockMvc.perform(post("/api/apparecchiature")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("Numero di serie già esistente: SN-DUP-001"));
    }

    @Test
    @DisplayName("GET albero organizzazione con apparecchiature nei contenitori")
    @WithMockUser(roles = "USER")
    void getTree_success() throws Exception {
        apparecchiaturaRepository.save(Apparecchiatura.builder()
                .nome("Mammografo GE")
                .tipologia(Tipologia.MAMMOGRAFO)
                .numeroDiSerie("SN-TREE-001")
                .dataInstallazione(LocalDate.of(2024, 2, 28))
                .organizzazione(org)
                .contenitore(contenitore)
                .build());

        entityManager.flush();
        entityManager.clear();

        mockMvc.perform(get("/api/organizzazioni/{id}/tree", org.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(org.getId()))
                .andExpect(jsonPath("$.nome").value("Gruppo San Raffaele"))
                .andExpect(jsonPath("$.contenitori[0].nome").value("Edificio A"))
                .andExpect(jsonPath("$.contenitori[0].apparecchiature[0].nome").value("Mammografo GE"));
    }

    @Test
    @DisplayName("GET organizzazione inesistente restituisce 404")
    @WithMockUser(roles = "USER")
    void getTree_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/organizzazioni/{id}/tree", 99999L))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("POST data futura restituisce 400")
    @WithMockUser(roles = "ADMIN")
    void createApparecchiatura_futureDate_returns400() throws Exception {
        Map<String, Object> body = Map.of(
            "nome", "TAC Futura",
            "tipologia", "TAC",
            "numeroDiSerie", "SN-FUT-001",
            "dataInstallazione", LocalDate.now().plusDays(30).toString(),
            "organizzazioneId", org.getId()
        );

        mockMvc.perform(post("/api/apparecchiature")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("La data di installazione non può essere nel futuro"));
    }
}
