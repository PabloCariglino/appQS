package com.QS.AppQuickSolutions.controller;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.PartDto;
import com.QS.AppQuickSolutions.services.QRCodeService;
import com.google.zxing.WriterException;

@RestController
@RequestMapping("/api/qr")
public class QRCodeController {

    @Autowired
    private QRCodeService qrCodeService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/generate-qr")
public ResponseEntity<?> generateQRCode(@RequestBody PartDto partDto) throws WriterException, IOException {
    try {
        // Verificar que customPart y partMaterial no sean nulos
        if (partDto.getCustomPart() == null || partDto.getPartMaterial() == null) {
            throw new IllegalArgumentException("CustomPart y PartMaterial no pueden ser nulos.");
        }

        System.out.println("Datos recibidos para generar QR: " + partDto.toString());

        // Generar los datos del QR basados en los atributos de la pieza
        String qrData = "Part ID: " + partDto.getCustomPart().getId() +
                        "\nCustomPart: " + partDto.getCustomPart().getCustomPart() +
                        "\nMaterial: " + partDto.getPartMaterial().getMaterialName();

        System.out.println("Datos del QR generados: " + qrData);

        // Generar el código QR y obtener la ruta del archivo
        String qrFilePath = qrCodeService.generateQRCodeImage(qrData, 300, 300, UUID.randomUUID() + "_part_qr.png");

        System.out.println("Ruta del archivo QR generado: " + qrFilePath);

        // Devolver la ruta del archivo generado
        return ResponseEntity.ok(Map.of("filePath", qrFilePath));
    } catch (Exception e) {
        System.err.println("Error al generar el código QR: " + e.getMessage());
        return ResponseEntity.status(500).body("Error al generar el código QR: " + e.getMessage());
    }
}
}