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
        Part part = new Part();

        part.setProject(project);
        part.setCustomPart(partDto.getCustomPart());
        part.setPartMaterial(partDto.getPartMaterial());
        part.setTotalweightKg(partDto.getTotalweightKg());
        part.setSheetThicknessMm(partDto.getSheetThicknessMm());
        part.setLengthPiecesMm(partDto.getLengthPiecesMm());
        part.setHeightMm(partDto.getHeightMm());
        part.setWidthMm(partDto.getWidthMm());
        part.setObservations(partDto.getObservations());

        // Generar datos para el QR
        String qrData = "Part ID: " + UUID.randomUUID() +
                "\nProject: " + project.getProjectName() +
                "\nCustomPart: " + partDto.getCustomPart().getCustomPart() +
                "\nMaterial: " + partDto.getPartMaterial().getMaterialName();
        part.setQrCodeData(qrData);

        // Generar QR
        String qrFilePath = qrCodeService.generateQRCodeImage(qrData, 300, 300, UUID.randomUUID() + "_part_qr.png");
        part.setQrCodeFilePath(qrFilePath);

        return partRepository.save(part);
    }

    public List<Part> getAllParts() {
        return partRepository.findAll();
    }

    public Part getPartById(UUID id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Part no encontrada con ID: " + id));
    }

    public Part scanPart(UUID id) {
        Part part = getPartById(id);
        part.setReceptionState(true);
        part.setScanDateTime(LocalDateTime.now());
        return partRepository.save(part);
    }

    public void deletePart(UUID id) {
        if (!partRepository.existsById(id)) {
            throw new EntityNotFoundException("Part no encontrada con ID: " + id);
        }
        partRepository.deleteById(id);
    }
}
