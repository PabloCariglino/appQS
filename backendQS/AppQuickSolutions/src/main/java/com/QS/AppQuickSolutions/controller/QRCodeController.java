package com.QS.AppQuickSolutions.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @PreAuthorize("hasRole('ADMIN') or hasrole('OPERATOR')")
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

    @PreAuthorize("hasRole('ADMIN') or hasrole('OPERATOR')")
    @GetMapping("/get-qr/{qrCodeId}")
    public ResponseEntity<?> getQRCode(@PathVariable String qrCodeId) {
        try {
            String filePath = qrCodeService.getQRCode(qrCodeId);
            return ResponseEntity.ok(Map.of("filePath", filePath));
        } catch (IOException e) {
            return ResponseEntity.status(404).body("Error al obtener el código QR: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasrole('OPERATOR')")
    @PutMapping("/update-qr/{qrCodeId}")
    public ResponseEntity<?> updateQRCode(@PathVariable String qrCodeId, @RequestBody PartDto partDto) {
        try {
            String filePath = qrCodeService.updateQRCode(qrCodeId, partDto);
            return ResponseEntity.ok(Map.of("filePath", filePath));
        } catch (WriterException | IOException e) {
            return ResponseEntity.status(500).body("Error al actualizar el código QR: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasrole('OPERATOR')")
    @DeleteMapping("/delete-qr/{qrCodeId}")
    public ResponseEntity<?> deleteQRCode(@PathVariable String qrCodeId) {
        try {
            qrCodeService.deleteQRCode(qrCodeId);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error al eliminar el código QR: " + e.getMessage());
        }
    }
}