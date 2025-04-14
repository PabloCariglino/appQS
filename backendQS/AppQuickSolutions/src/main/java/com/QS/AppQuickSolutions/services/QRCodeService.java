package com.QS.AppQuickSolutions.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.dto.PartDto;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.PartStatusTracking;
import com.QS.AppQuickSolutions.enums.PartState;
import com.QS.AppQuickSolutions.repository.PartRepository;
import com.QS.AppQuickSolutions.repository.PartStatusTrackingRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class QRCodeService {

    @Value("${qrcode.upload-dir}")
    private String qrDirectory;

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private PartStatusTrackingRepository partStatusTrackingRepository;

    /**
     * Genera los datos del QR a partir de un Part entity.
     */
    public String generateQrDataFromPart(Part part) {
        if (part == null) {
            throw new IllegalArgumentException("La pieza no puede ser nula.");
        }

        return "Part ID: " + (part.getId() != null ? part.getId().toString() : "N/A") +
               "\nProject ID: " + (part.getProject() != null ? part.getProject().getId().toString() : "N/A") +
               "\nCustomPart: " + (part.getCustomPart() != null ? part.getCustomPart().getCustomPartName() : "N/A") +
               "\nMaterial: " + (part.getPartMaterial() != null ? part.getPartMaterial().getMaterialName() : "N/A") +
               "\nWeight: " + (part.getTotalweightKg() != null ? part.getTotalweightKg() : "N/A") +
               "\nThickness: " + (part.getSheetThicknessMm() != null ? part.getSheetThicknessMm() : "N/A") +
               "\nLength: " + (part.getLengthPiecesMm() != null ? part.getLengthPiecesMm() : "N/A") +
               "\nHeight: " + (part.getHeightMm() != null ? part.getHeightMm() : "N/A") +
               "\nWidth: " + (part.getWidthMm() != null ? part.getWidthMm() : "N/A") +
               "\nReception State: " + (part.getReceptionState() != null ? part.getReceptionState().toString() : "false");
    }

    /**
     * Genera la imagen del QR y devuelve la ruta del archivo.
     */
    public String generateQRCodeImage(String qrData, int width, int height, String fileName) throws WriterException, IOException {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        Path qrPathDirectory = Paths.get(qrDirectory).toAbsolutePath(); // Usar path absoluto
        if (!Files.exists(qrPathDirectory)) {
            Files.createDirectories(qrPathDirectory);
        }

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrData, BarcodeFormat.QR_CODE, width, height, hints);
        Path qrPath = qrPathDirectory.resolve(fileName);
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", qrPath);

        return fileName;
    }

    /**
     * Genera el QR completo (datos + imagen) a partir de una Part entity ya persistida.
     */
    public String generateQRCodeForPart(Part part) throws WriterException, IOException {
        if (part == null) {
            throw new IllegalArgumentException("La pieza no puede ser nula.");
        }
        String qrData = generateQrDataFromPart(part);
        return generateQRCodeImage(qrData, 300, 300, part.getId() + "_part_qr.png");
    }

    /**
     * Genera el QR completo (datos + imagen) a partir de un PartDto (para compatibilidad).
     */
    public String generateQRCodeForPartDto(PartDto partDto) throws WriterException, IOException {
        String qrData = generateQrDataFromPartDto(partDto);
        String fileName = partDto.getId() != null ? partDto.getId() + "_part_qr.png" : UUID.randomUUID() + "_part_qr.png";
        return generateQRCodeImage(qrData, 300, 300, fileName);
    }

    /**
     * Genera los datos del QR a partir de un PartDto.
     */
    public String generateQrDataFromPartDto(PartDto partDto) {
        if (partDto.getCustomPart() == null || partDto.getPartMaterial() == null) {
            throw new IllegalArgumentException("CustomPart y PartMaterial no pueden ser nulos.");
        }

        return "Part ID: " + (partDto.getId() != null ? partDto.getId().toString() : "N/A") +
               "\nProject ID: " + (partDto.getProject() != null ? partDto.getProject().getId().toString() : "N/A") +
               "\nCustomPart: " + (partDto.getCustomPart() != null ? partDto.getCustomPart().getCustomPartName() : "N/A") +
               "\nMaterial: " + (partDto.getPartMaterial() != null ? partDto.getPartMaterial().getMaterialName() : "N/A") +
               "\nWeight: " + (partDto.getTotalweightKg() != null ? partDto.getTotalweightKg() : "N/A") +
               "\nThickness: " + (partDto.getSheetThicknessMm() != null ? partDto.getSheetThicknessMm() : "N/A") +
               "\nLength: " + (partDto.getLengthPiecesMm() != null ? partDto.getLengthPiecesMm() : "N/A") +
               "\nHeight: " + (partDto.getHeightMm() != null ? partDto.getHeightMm() : "N/A") +
               "\nWidth: " + (partDto.getWidthMm() != null ? partDto.getWidthMm() : "N/A") +
               "\nReception State: " + (partDto.getReceptionState() != null ? partDto.getReceptionState().toString() : "false");
    }

    /**
    * Actualiza el estado de una pieza después de escanear su QR.
    */
    public Part scanQRCode(String qrData) {
        String[] qrParts = qrData.split("\n");
        String partIdString = qrParts[0].split(":")[1].trim();
        UUID partId = UUID.fromString(partIdString);

        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Pieza no encontrada"));

        // Cambiar el estado de la pieza a "recibida" y actualizar el scanDateTime
        part.setReceptionState(true);
        part.setScanDateTime(LocalDateTime.now());

        // Cambiar el estado de la pieza a CONTROL_CALIDAD
        part.setPartState(PartState.CONTROL_CALIDAD_EN_FABRICA);
        partRepository.save(part);

        // Verificar si ya hay un seguimiento activo para esta pieza
        partStatusTrackingRepository.findByPartAndIsCompletedFalse(part)
                .ifPresent(tracking -> {
                    throw new RuntimeException("La pieza ya tiene un seguimiento activo");
                });

        // Crear un nuevo registro de seguimiento
        PartStatusTracking tracking = new PartStatusTracking();
        tracking.setPart(part);
        tracking.setPartState(PartState.CONTROL_CALIDAD_EN_FABRICA);
        tracking.setStartTime(LocalDateTime.now());
        tracking.setCompleted(false);
        // No asignamos un operador, ya que el escaneo es un proceso automático
        partStatusTrackingRepository.save(tracking);

        return part;
    }

    /**
     * Método utilitario para verificar si un archivo QR existe.
     */
    public boolean qrFileExists(String fileName) {
        Path qrPath = Paths.get(qrDirectory, fileName);
        return Files.exists(qrPath) && Files.isReadable(qrPath);
    }

    /**
     * Elimina un archivo QR del sistema de archivos.
     */
    public void deleteQRCode(String qrCodeId) throws IOException {
        String fileName = qrCodeId + "_part_qr.png";
        Path qrPath = Paths.get(qrDirectory, fileName);
        if (Files.exists(qrPath)) {
            Files.delete(qrPath);
        } else {
            throw new IOException("El archivo QR no existe: " + fileName);
        }
    }

    /**
     * Obtiene los datos de un QR (lee el archivo y devuelve el nombre del archivo).
     */
    public String getQRCode(String qrCodeId) throws IOException {
        String fileName = qrCodeId + "_part_qr.png";
        Path qrPath = Paths.get(qrDirectory, fileName);
        if (Files.exists(qrPath)) {
            return fileName;
        } else {
            throw new IOException("El archivo QR no existe: " + fileName);
        }
    }

    /**
     * Actualiza un QR existente (elimina el anterior y genera uno nuevo).
     */
    public String updateQRCode(String qrCodeId, PartDto partDto) throws WriterException, IOException {
        // Eliminar el QR existente
        deleteQRCode(qrCodeId);
        // Generar un nuevo QR con los datos actualizados
        return generateQRCodeForPartDto(partDto);
    }


    // GENERACION Y ESCANEO PARA CONFIRMACION DE ENVIO A INSTALACION DE LAS PIEZAS
    public String generateCustomQRCode(String qrData, String fileName) throws WriterException, IOException {
        return generateQRCodeImage(qrData, 300, 300, fileName);
    }
    
    public Part scanDeliveryQRCode(String qrData) {
        String[] qrParts = qrData.split(",");
        String partIdString = qrParts[1].split(":")[1].trim();
        UUID partId = UUID.fromString(partIdString);
    
        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Pieza no encontrada"));
    
        if (!part.isReadyForDelivery()) {
            part.setReadyForDelivery(true);
            return partRepository.save(part);
        } else {
            throw new RuntimeException("Pieza ya marcada como lista para entrega");
        }
    }
}