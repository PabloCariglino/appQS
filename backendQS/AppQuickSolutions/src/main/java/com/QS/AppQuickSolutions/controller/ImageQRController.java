package com.QS.AppQuickSolutions.controller;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/qr-codes")
public class ImageQRController {

    // private final Path qrCodeDirectory = Paths.get("backenQS/src/main/resources/qr-codes");

    private final Path qrCodeDirectory;

    public ImageQRController(@Value("${qrcode.upload-dir:../../qr-codes}") String qrDirectory) {
        this.qrCodeDirectory = Paths.get(qrDirectory);
    }


    @GetMapping("/{filename}")
    @PreAuthorize("isAuthenticated() or hasRole('ADMIN') or hasRole('OPERATOR')")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path file = qrCodeDirectory.resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_PNG)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}