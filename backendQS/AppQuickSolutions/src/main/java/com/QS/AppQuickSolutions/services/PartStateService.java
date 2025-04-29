package com.QS.AppQuickSolutions.services;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.dto.PartTrackingSummaryDTO;
import com.QS.AppQuickSolutions.dto.PartsByStateDTO;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.PartStatusTracking;
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
                .filter(state -> state != PartState.DESARROLLO && state != PartState.EN_PRODUCCION)
                .map(state -> {
                    List<Part> partsInState = partRepository.findByPartState(state);
                    List<PartTrackingSummaryDTO> partsWithStatus = partsInState.stream().map(part -> {
                        PartTrackingSummaryDTO dto = new PartTrackingSummaryDTO();
                        dto.setPartId(part.getId());
                        dto.setProjectId(part.getProject().getId());
                        dto.setPartName(part.getCustomPart().getCustomPartName());
                        dto.setPartState(part.getPartState());
                        dto.setScanDateTime(part.getScanDateTime());

                        // Verificar si la pieza tiene un seguimiento activo
                        Optional<PartStatusTracking> tracking = partStatusTrackingRepository
                                .findByPartAndIsCompletedFalse(part);
                        if (tracking.isPresent()) {
                            PartStatusTracking activeTracking = tracking.get();
                            dto.setTrackingId(activeTracking.getId());
                            dto.setStartTime(activeTracking.getStartTime());
                            dto.setEndTime(activeTracking.getEndTime());
                            dto.setCompleted(activeTracking.isCompleted());
                            dto.setTaken(false);
                            dto.setTaken(activeTracking.isTaken()); // Corregido: Usar setIsTaken
                        } else {
                            dto.setTaken(false); // Corregido: Usar setIsTaken
                        }
                        return dto;
                    }).collect(Collectors.toList());

                    PartsByStateDTO dto = new PartsByStateDTO();
                    dto.setState(state);
                    dto.setParts(partsWithStatus);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}