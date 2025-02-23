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

    @Autowired
    private QRCodeService qrCodeService;

    @Transactional
    public Part createPart(Project project, PartDto partDto) throws IOException, WriterException {
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
        part.setReceptionState(false); // Inicializar explícitamente en false
        part.setScanDateTime(null); // Dejar como null

        // Guardar la pieza primero para obtener el ID
        Part savedPart = partRepository.save(part);

        // Generar el QR usando la pieza persistida
        String qrData = qrCodeService.generateQrDataFromPart(savedPart);
        String qrFilePath = qrCodeService.generateQRCodeImage(qrData, 300, 300, UUID.randomUUID() + "_part_qr.png");
        savedPart.setQrCodeData(qrData);
        savedPart.setQrCodeFilePath(qrFilePath);

        return partRepository.save(savedPart); // Guardar nuevamente con el QR
    }

    public Part updatePart(UUID id, PartDto partDto) throws IOException, WriterException {
        validatePartDto(partDto);

        Part existingPart = partRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pieza no encontrada con ID: " + id));

        populatePartData(existingPart, partDto);

        // Regenerar el QR si cambia algo relevante
        if (isQrDataChanged(existingPart, partDto)) {
            String qrData = qrCodeService.generateQrDataFromPart(existingPart);
            String qrFilePath = qrCodeService.generateQRCodeImage(qrData, 300, 300, UUID.randomUUID() + "_part_qr.png");
            existingPart.setQrCodeData(qrData); // Actualizar el dato del QR
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
        part.setPartState(partDto.getPartState());
        part.setQualityControlState(partDto.getQualityControlState());
        part.setScanDateTime(null); // O asigna un valor por defecto si es necesario
        part.setReceptionState(partDto.getReceptionState() != null ? partDto.getReceptionState() : false); // Valor por defecto
    }

    // Verificar si los datos relevantes del QR cambiaron
    private boolean isQrDataChanged(Part part, PartDto partDto) {
        return !part.getCustomPart().equals(partDto.getCustomPart())
                || !part.getPartMaterial().equals(partDto.getPartMaterial());
    }

    public Part scanPart(UUID id) {
        Part part = getPartById(id);
        part.setReceptionState(true);
        part.setScanDateTime(LocalDateTime.now());
        return partRepository.save(part);
    }
}