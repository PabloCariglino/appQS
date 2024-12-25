package com.QS.AppQuickSolutions.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.QS.AppQuickSolutions.entity.CustomPart;
import com.QS.AppQuickSolutions.services.CustomPartService;

@RestController
@RequestMapping("/api/customParts")
public class CustomPartController {

    private final CustomPartService customPartService;

    public CustomPartController(CustomPartService customPartService) {
        this.customPartService = customPartService;
    }

    @GetMapping
    public ResponseEntity<List<CustomPart>> getAllCustomParts() {
        List<CustomPart> parts = customPartService.getAllCustomParts();
        return ResponseEntity.ok(parts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomPart> getCustomPartById(@PathVariable Long id) {
        CustomPart part = customPartService.getCustomPartById(id);
        return ResponseEntity.ok(part);
    }

   @PreAuthorize("hasRole('ADMIN')")
   @PostMapping
   public ResponseEntity<CustomPart> createCustomPart(
        @RequestParam(value = "customPart", required = false) String customPartName,
        @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

    if (customPartName == null || customPartName.trim().isEmpty()) {
        throw new IllegalArgumentException("El nombre de la pieza es obligatorio.");
    }

    CustomPart createdPart = customPartService.createCustomPart(customPartName, image);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdPart);
}


    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public CustomPart updateCustomPart(@PathVariable Long id,
                                   @RequestParam(value = "customPart", required = false) String customPartName,
                                   @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
    return customPartService.updateCustomPart(id, customPartName, image);
}


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomPart(@PathVariable Long id) {
        customPartService.deleteCustomPart(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<CustomPart> uploadImage(@PathVariable Long id, @RequestParam("image") MultipartFile image) throws IOException {
        CustomPart updatedPart = customPartService.uploadImage(id, image);
        return ResponseEntity.ok(updatedPart);
    }
}
