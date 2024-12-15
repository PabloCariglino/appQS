package com.QS.AppQuickSolutions.controller;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.PartDto;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.Project;
import com.QS.AppQuickSolutions.services.PartService;
import com.QS.AppQuickSolutions.services.ProjectService;
import com.google.zxing.WriterException;

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
            return ResponseEntity.status(HttpStatus.CREATED).body(part);
        } catch (IOException | WriterException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al generar el código QR: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @GetMapping("/list")
    public ResponseEntity<List<Part>> getAllParts() {
        List<Part> parts = partService.getAllParts();
        return ResponseEntity.ok(parts);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Part> getPartById(@PathVariable UUID id) {
        Part part = partService.getPartById(id);
        return ResponseEntity.ok(part);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @PostMapping("/{id}/scan")
    public ResponseEntity<Part> scanPart(@PathVariable UUID id) {
        Part part = partService.scanPart(id);
        return ResponseEntity.ok(part);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<Void> deletePart(@PathVariable UUID id) {
        partService.deletePart(id);
        return ResponseEntity.noContent().build();
    }
}
