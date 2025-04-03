package com.QS.AppQuickSolutions.controller;

import java.io.IOException;
import java.util.List;

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

    @GetMapping("/custom-part-list")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public List<CustomPart> getAllCustomParts() {
        return customPartService.getAllCustomParts();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public CustomPart getCustomPartById(@PathVariable Long id) {
        return customPartService.getCustomPartById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public CustomPart createCustomPart(
            @RequestParam("customPartName") String customPartName,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        if (customPartName == null || customPartName.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la pieza es obligatorio.");
        }
        return customPartService.createCustomPart(customPartName, image);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public CustomPart updateCustomPart(
            @PathVariable Long id,
            @RequestParam(value = "customPartName", required = false) String customPartName,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        return customPartService.updateCustomPart(id, customPartName, image);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Void> deleteCustomPart(@PathVariable Long id) {
        customPartService.deleteCustomPart(id);
        return ResponseEntity.ok().build();
    }
}