package com.QS.AppQuickSolutions.services;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.QS.AppQuickSolutions.dto.PartDto;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.Project;
import com.QS.AppQuickSolutions.repository.PartRepository;
import com.google.zxing.WriterException;

import jakarta.persistence.EntityNotFoundException;

@Service
public class PartService {
    @Autowired
    private PartRepository partRepository;

    @Transactional
    public Part createPart(Project project, PartDto partDto) throws IOException {
        validatePartDto(partDto);

        Part part = new Part();
        part.setProject(project);

        // Asignar CustomPart y PartMaterial
        part.setCustomPart(partDto.getCustomPart());
        part.setPartMaterial(partDto.getPartMaterial());

        // Asignar otros campos
        part.setTotalweightKg(partDto.getTotalweightKg());
        part.setSheetThicknessMm(partDto.getSheetThicknessMm());
        part.setLengthPiecesMm(partDto.getLengthPiecesMm());
        part.setHeightMm(partDto.getHeightMm());
        part.setWidthMm(partDto.getWidthMm());
        part.setObservations(partDto.getObservations());
        part.setReceptionState(false); // Inicializar en false
        part.setScanDateTime(null); // Dejar como null

        // Guardar la pieza primero para obtener el ID, pero sin generar QR
        return partRepository.save(part);
    }

    public Part updatePart(UUID id, PartDto partDto) throws IOException, WriterException {
        validatePartDto(partDto);

        Part existingPart = partRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pieza no encontrada con ID: " + id));

        populatePartData(existingPart, partDto);

        // No generamos QR aquí, delegamos a ProjectService si es necesario
        return partRepository.save(existingPart);
    }

    public List<Part> getAllParts() {
        return partRepository.findAll();
    }

    public Part getPartById(UUID id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pieza no encontrada con ID: " + id));
    }

    public void deletePart(UUID id) {
        if (!partRepository.existsById(id)) {
            throw new EntityNotFoundException("Pieza no encontrada con ID: " + id);
        }
        partRepository.deleteById(id);
    }

    private void validatePartDto(PartDto partDto) {
        if (partDto.getCustomPart() == null) {
            throw new IllegalArgumentException("El nombre de la pieza personalizada no puede estar vacío.");
        }
        if (partDto.getPartMaterial() == null) {
            throw new IllegalArgumentException("El material de la pieza no puede estar vacío.");
        }
    }

    private void populatePartData(Part part, PartDto partDto) {
        part.setCustomPart(partDto.getCustomPart());
        part.setPartMaterial(partDto.getPartMaterial());
        part.setTotalweightKg(partDto.getTotalweightKg());
        part.setSheetThicknessMm(partDto.getSheetThicknessMm());
        part.setLengthPiecesMm(partDto.getLengthPiecesMm());
        part.setHeightMm(partDto.getHeightMm());
        part.setWidthMm(partDto.getWidthMm());
        part.setObservations(partDto.getObservations());
        part.setPartState(partDto.getPartState());
        part.setQualityControlState(partDto.getQualityControlState());
        part.setScanDateTime(partDto.getScanDateTime() != null ? partDto.getScanDateTime() : null);
        part.setReceptionState(partDto.getReceptionState() != null ? partDto.getReceptionState() : false);
    }

    public Part scanPart(UUID id) {
        Part part = getPartById(id);
        part.setReceptionState(true);
        part.setScanDateTime(LocalDateTime.now());
        return partRepository.save(part);
    }

    @Transactional
    public Part save(Part part) {
        return partRepository.save(part);
    }

    // public Part findById(String id) {
    //     return partRepository.findById(id).orElse(null);
    // }
}