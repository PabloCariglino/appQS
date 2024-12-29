package com.QS.AppQuickSolutions.controller;

import java.util.List;

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

import com.QS.AppQuickSolutions.entity.PartMaterial;
import com.QS.AppQuickSolutions.services.PartMaterialService;

@RestController
@RequestMapping("/api/part-materials")
public class PartMaterialController {

    @Autowired
    private PartMaterialService partMaterialService;

    // @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/material-list")
    public ResponseEntity<List<PartMaterial>> getAllPartMaterials() {
        List<PartMaterial> materials = partMaterialService.getAllMaterials();
        return ResponseEntity.ok(materials);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<PartMaterial> createPartMaterial(@RequestBody PartMaterial partMaterial) {
        try {
            PartMaterial savedMaterial = partMaterialService.createMaterial(partMaterial);
            return ResponseEntity.ok(savedMaterial);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<PartMaterial> updatePartMaterial(
            @PathVariable Long id, @RequestBody PartMaterial updatedMaterial) {
        try {
            PartMaterial savedMaterial = partMaterialService.updateMaterial(id, updatedMaterial);
            return ResponseEntity.ok(savedMaterial);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartMaterial(@PathVariable Long id) {
        try {
            partMaterialService.deleteMaterial(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
