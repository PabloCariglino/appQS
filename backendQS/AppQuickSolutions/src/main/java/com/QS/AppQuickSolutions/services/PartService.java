package com.QS.AppQuickSolutions.services;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    @Autowired
    private QRCodeService qrCodeService;

    public Part createPart(Project project, PartDto partDto) throws IOException, WriterException {
        validatePartDto(partDto);

        Part part = new Part();
        part.setProject(project);
        populatePartData(part, partDto);

        // Generar código QR
        String qrData = generateQrData(part);
        String qrFilePath = qrCodeService.generateQRCodeImage(qrData, 300, 300, UUID.randomUUID() + "_part_qr.png");
        part.setQrCodeFilePath(qrFilePath);

        return partRepository.save(part);
    }

    public Part updatePart(UUID id, PartDto partDto) throws IOException, WriterException {
        validatePartDto(partDto);

        Part existingPart = partRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pieza no encontrada con ID: " + id));

        populatePartData(existingPart, partDto);

        // Regenerar código QR si cambia algo relevante
        if (isQrDataChanged(existingPart, partDto)) {
            String qrData = generateQrData(existingPart);
            String qrFilePath = qrCodeService.generateQRCodeImage(qrData, 300, 300, UUID.randomUUID() + "_part_qr.png");
            existingPart.setQrCodeFilePath(qrFilePath);
        }

        return partRepository.save(existingPart);
    }

    public List<Part> getAllParts() {
        return partRepository.findAll();
    }

    public Part getPartById(UUID id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pieza no encontrada con ID: " + id));
    }

    public Part scanPart(UUID id) {
        Part part = getPartById(id);
        part.setReceptionState(true);
        part.setScanDateTime(LocalDateTime.now());
        return partRepository.save(part);
    }

    public void deletePart(UUID id) {
        if (!partRepository.existsById(id)) {
            throw new EntityNotFoundException("Pieza no encontrada con ID: " + id);
        }
        partRepository.deleteById(id);
    }

    // Validar los datos recibidos
    private void validatePartDto(PartDto partDto) {
        if (partDto.getCustomPart() == null) {
            throw new IllegalArgumentException("El nombre de la pieza personalizada no puede estar vacío.");
        }
        if (partDto.getPartMaterial() == null) {
            throw new IllegalArgumentException("El material de la pieza no puede estar vacío.");
        }
    }

    // Poblar los datos de la pieza desde el DTO
    private void populatePartData(Part part, PartDto partDto) {
        part.setCustomPart(partDto.getCustomPart());
        part.setPartMaterial(partDto.getPartMaterial());
        part.setTotalweightKg(partDto.getTotalweightKg());
        part.setSheetThicknessMm(partDto.getSheetThicknessMm());
        part.setLengthPiecesMm(partDto.getLengthPiecesMm());
        part.setHeightMm(partDto.getHeightMm());
        part.setWidthMm(partDto.getWidthMm());
        part.setObservations(partDto.getObservations());
    }

    // Verificar si los datos relevantes del QR cambiaron
    private boolean isQrDataChanged(Part part, PartDto partDto) {
        return !part.getCustomPart().equals(partDto.getCustomPart())
                || !part.getPartMaterial().equals(partDto.getPartMaterial());
    }

    // Generar datos del QR basados en la pieza
    private String generateQrData(Part part) {
        return "Part ID: " + part.getId() +
                "\nProject: " + part.getProject().getProjectName() +
                "\nCustomPart: " + part.getCustomPart().getCustomPart() +
                "\nMaterial: " + part.getPartMaterial().getMaterialName();
    }
}
