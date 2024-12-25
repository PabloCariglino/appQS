package com.QS.AppQuickSolutions.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

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
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.Project;
import com.QS.AppQuickSolutions.services.PartService;
import com.QS.AppQuickSolutions.services.ProjectService;
import com.google.zxing.WriterException;

import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api/part")
public class PartController {

    @Autowired
    private PartService partService;

    @Autowired
    private ProjectService projectService;

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @PostMapping("/{projectId}/create")
    public ResponseEntity<?> createPart(@PathVariable Long projectId, @RequestBody PartDto partDto) {
        try {
            Project project = projectService.getProjectById(projectId);
            Part part = partService.createPart(project, partDto);
            return ResponseEntity.status(201).body(part);
        } catch (IOException | WriterException e) {
            return ResponseEntity.status(500).body("Error al generar el código QR: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Datos inválidos: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @PutMapping("/{id}/update")
    public ResponseEntity<?> updatePart(@PathVariable UUID id, @RequestBody PartDto partDto) {
        try {
            Part updatedPart = partService.updatePart(id, partDto);
            return ResponseEntity.ok(updatedPart);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body("Pieza no encontrada con ID: " + id);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body("Datos inválidos: " + e.getMessage());
        } catch (IOException | WriterException e) {
            return ResponseEntity.status(500).body("Error al actualizar el código QR: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getPartById(@PathVariable UUID id) {
        try {
            Part part = partService.getPartById(id);
            return ResponseEntity.ok(part);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body("Pieza no encontrada con ID: " + id);
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @GetMapping("/list")
    public ResponseEntity<List<Part>> getAllParts() {
        return ResponseEntity.ok(partService.getAllParts());
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @PostMapping("/{id}/scan")
    public ResponseEntity<?> scanPart(@PathVariable UUID id) {
        try {
            Part part = partService.scanPart(id);
            return ResponseEntity.ok(part);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body("Pieza no encontrada con ID: " + id);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<?> deletePart(@PathVariable UUID id) {
        try {
            partService.deletePart(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(404).body("Pieza no encontrada con ID: " + id);
        }
    }
}
