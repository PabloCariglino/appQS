package com.QS.AppQuickSolutions.services;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.dto.PartDto;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.enums.Material;
import com.QS.AppQuickSolutions.enums.PartName;
import com.QS.AppQuickSolutions.enums.Role;
import com.QS.AppQuickSolutions.repository.PartRepository;
import com.QS.AppQuickSolutions.repository.ProjectRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class PartService {

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public Part updatePart(UUID id, PartDto partDto, User user) {
        Part existingPart = partRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Part not found"));

        if (user.getRole() == Role.ADMIN) {
            existingPart.setPartName(PartName.valueOf(partDto.getPartName()));
            existingPart.setMaterial(Material.valueOf(partDto.getMaterial()));
            existingPart.setTotalweightKg(partDto.getTotalweightKg());
            existingPart.setSheetThicknessMm(partDto.getSheetThicknessMm());
            existingPart.setLengthPiecesMm(partDto.getLengthPiecesMm());
            existingPart.setHeightMm(partDto.getHeightMm());
            existingPart.setWidthMm(partDto.getWidthMm());
        }

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.OPERATOR) {
            existingPart.setScanDateTime(partDto.getScanDateTime());
            existingPart.setReceptionState(partDto.getReceptionState());
            existingPart.setQualityControlState(partDto.getQualityControlState());
            existingPart.setObservations(partDto.getObservations());
        }

        return partRepository.save(existingPart);
    }

    public List<Part> getAllParts() {
        return partRepository.findAll();
    }

     public List<Part> getPartsByProject(Long projectId) {
        // Verifica si el proyecto existe
        if (!projectRepository.existsById(projectId)) {
            throw new EntityNotFoundException("Proyecto no encontrado con ID: " + projectId);
        }

        // Obtiene las partes asociadas al proyecto
        return partRepository.findByProjectId(projectId);
    }

    public void deletePart(UUID id) {
        partRepository.deleteById(id);
    }
}
