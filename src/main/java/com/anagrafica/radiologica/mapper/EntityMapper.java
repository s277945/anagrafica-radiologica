package com.anagrafica.radiologica.mapper;

import com.anagrafica.radiologica.api.model.ApparecchiaturaResponse;
import com.anagrafica.radiologica.entity.Apparecchiatura;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {

    public ApparecchiaturaResponse toResponse(Apparecchiatura entity) {
        ApparecchiaturaResponse response = new ApparecchiaturaResponse();
        response.setId(entity.getId());
        response.setNome(entity.getNome());
        response.setTipologia(entity.getTipologia().name());
        response.setNumeroDiSerie(entity.getNumeroDiSerie());
        response.setDataInstallazione(entity.getDataInstallazione());
        response.setOrganizzazioneId(entity.getOrganizzazione().getId());
        response.setContenitoreId(entity.getContenitore() != null ? entity.getContenitore().getId() : null);
        return response;
    }
}
