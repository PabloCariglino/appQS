package com.QS.AppQuickSolutions.services;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.dto.PartTrackingSummaryDTO;
import com.QS.AppQuickSolutions.dto.PartsByStateDTO;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.enums.PartState;
import com.QS.AppQuickSolutions.repository.PartRepository;
import com.QS.AppQuickSolutions.repository.PartStatusTrackingRepository;

@Service
public class PartStateService {
    @Autowired
    private PartRepository partRepository;

    @Autowired
    private PartStatusTrackingRepository partStatusTrackingRepository;

    public List<PartsByStateDTO> getPartsByState() {
        return Arrays.stream(PartState.values())
                .filter(state -> state != PartState.DESARROLLO && state != PartState.EN_PRODUCCION) // Excluir estados iniciales
                .map(state -> {
                    // Obtener piezas en este estado que no estén tomadas (sin seguimiento activo)
                    List<Part> partsInState = partRepository.findByPartState(state);
                    List<PartTrackingSummaryDTO> availableParts = partsInState.stream()
                            .filter(part -> partStatusTrackingRepository
                                    .findByPartIdAndUserOperatorAndIsCompletedFalse(part.getId(), null)
                                    .isEmpty())
                            .map(part -> {
                                PartTrackingSummaryDTO dto = new PartTrackingSummaryDTO();
                                dto.setPartId(part.getId());
                                dto.setProjectId(part.getProject().getId());
                                dto.setPartName(part.getCustomPart().getCustomPartName());
                                dto.setPartState(part.getPartState());
                                dto.setScanDateTime(part.getScanDateTime());
                                return dto;
                            })
                            .collect(Collectors.toList());

                    PartsByStateDTO dto = new PartsByStateDTO();
                    dto.setState(state);
                    dto.setParts(availableParts);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}