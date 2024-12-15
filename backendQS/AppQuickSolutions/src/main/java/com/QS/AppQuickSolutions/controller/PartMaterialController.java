package com.QS.AppQuickSolutions.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.entity.PartMaterial;
import com.QS.AppQuickSolutions.repository.PartMaterialRepository;

@RestController
@RequestMapping("/api/partMaterials")
public class PartMaterialController {
    
    @Autowired
    private PartMaterialRepository partMaterialRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<PartMaterial>> getAllPartMaterials() {
        List<PartMaterial> materials = partMaterialRepository.findAll();
        return ResponseEntity.ok(materials);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<PartMaterial> createPartMaterial(@RequestBody PartMaterial partMaterial) {
        if (partMaterial.getMaterialName() == null || partMaterial.getMaterialName().isEmpty()) {
            return ResponseEntity.badRequest().body(null); // Manejo básico de errores
        }
        PartMaterial savedMaterial = partMaterialRepository.save(partMaterial);
        return ResponseEntity.ok(savedMaterial);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartMaterial(@PathVariable Long id) {
        if (!partMaterialRepository.existsById(id)) {
            return ResponseEntity.notFound().build(); // Manejo de material no encontrado
        }
        partMaterialRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
