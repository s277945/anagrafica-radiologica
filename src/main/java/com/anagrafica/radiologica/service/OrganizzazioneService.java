package com.anagrafica.radiologica.service;

import com.anagrafica.radiologica.api.model.ContenitoreNode;
import com.anagrafica.radiologica.api.model.OrganizzazioneTree;
import com.anagrafica.radiologica.entity.*;
import com.anagrafica.radiologica.exception.ResourceNotFoundException;
import com.anagrafica.radiologica.mapper.EntityMapper;
import com.anagrafica.radiologica.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizzazioneService {

    private static final Logger logger = LoggerFactory.getLogger(OrganizzazioneService.class);

    private final OrganizzazioneRepository organizzazioneRepository;
    private final ContenitoreRepository contenitoreRepository;
    private final ApparecchiaturaRepository apparecchiaturaRepository;
    private final EntityMapper mapper;

    @Transactional(readOnly = true)
    public OrganizzazioneTree getTree(Long orgId) {
        logger.info("Recupero albero per organizzazione id: {}", orgId);

        Organizzazione org = organizzazioneRepository.findById(orgId)
            .orElseThrow(() -> new ResourceNotFoundException("Organizzazione", orgId));

        // 1 query: tutti i contenitori dell'organizzazione con le loro apparecchiature
        List<Contenitore> allContenitori = contenitoreRepository
            .findAllByOrganizzazioneWithApparecchiature(orgId);

        // 1 query: apparecchiature direttamente sotto l'organizzazione (senza contenitore)
        List<Apparecchiatura> rootApparecchiature = apparecchiaturaRepository
            .findByOrganizzazioneIdAndContenitoreIsNull(orgId);

        // Costruzione iterativa dell'albero con HashMap (DFS iterativo, zero ricorsione)
        Map<Long, ContenitoreNode> nodeMap = new LinkedHashMap<>();
        Map<Long, Long> parentMap = new HashMap<>();

        for (Contenitore c : allContenitori) {
            ContenitoreNode node = new ContenitoreNode();
            node.setId(c.getId());
            node.setNome(c.getNome());
            node.setSottoContenitori(new ArrayList<>());
            node.setApparecchiature(
                c.getApparecchiature().stream()
                    .map(mapper::toResponse)
                    .collect(Collectors.toList())
            );
            nodeMap.put(c.getId(), node);
            parentMap.put(c.getId(), c.getParent() != null ? c.getParent().getId() : null);
        }

        // Assemblaggio albero (DFS iterativo)
        List<ContenitoreNode> rootNodes = new ArrayList<>();
        for (Map.Entry<Long, ContenitoreNode> entry : nodeMap.entrySet()) {
            Long parentId = parentMap.get(entry.getKey());
            if (parentId == null) {
                rootNodes.add(entry.getValue());
            } else {
                ContenitoreNode parentNode = nodeMap.get(parentId);
                if (parentNode != null) {
                    parentNode.getSottoContenitori().add(entry.getValue());
                }
            }
        }

        // Composizione response
        OrganizzazioneTree tree = new OrganizzazioneTree();
        tree.setId(org.getId());
        tree.setNome(org.getNome());
        tree.setContenitori(rootNodes);
        tree.setApparecchiature(
            rootApparecchiature.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList())
        );

        logger.debug("Albero costruito: {} contenitori root, {} apparecchiature root",
            rootNodes.size(), rootApparecchiature.size());

        return tree;
    }
}
