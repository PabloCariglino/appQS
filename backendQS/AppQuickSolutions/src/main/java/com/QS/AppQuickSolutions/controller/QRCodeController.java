package com.QS.AppQuickSolutions.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.PartDto;
import com.QS.AppQuickSolutions.services.QRCodeService;

@RestController
@RequestMapping("/api/qr")
public class QRCodeController {

    @Autowired
    private QRCodeService qrCodeService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/generate-qr")
public ResponseEntity<?> generateQRCode(@RequestBody PartDto partDto) {
    try {
        // Llamar al servicio para generar el QR
        String qrFilePath = qrCodeService.generateQRCodeForPartDto(partDto);

        // Devolver la ruta del archivo generado
        return ResponseEntity.ok(Map.of("filePath", qrFilePath));
    } catch (Exception e) {
        System.err.println("Error al generar el código QR: " + e.getMessage());
        return ResponseEntity.status(500).body("Error al generar el código QR: " + e.getMessage());
    }
}

}

