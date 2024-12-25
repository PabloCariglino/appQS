package com.QS.AppQuickSolutions.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.entity.PartMaterial;
import com.QS.AppQuickSolutions.repository.PartMaterialRepository;

@Service
public class PartMaterialService {

    @Autowired
    private PartMaterialRepository partMaterialRepository;

    // Obtener todos los materiales
    public List<PartMaterial> getAllMaterials() {
        return partMaterialRepository.findAll();
    }

    // Crear un nuevo material
    public PartMaterial createMaterial(PartMaterial partMaterial) {
        if (partMaterial.getMaterialName() == null || partMaterial.getMaterialName().isEmpty()) {
            throw new IllegalArgumentException("El nombre del material no puede estar vacío.");
        }
        return partMaterialRepository.save(partMaterial);
    }

    // Actualizar un material existente
    public PartMaterial updateMaterial(Long id, PartMaterial updatedMaterial) {
        PartMaterial existingMaterial = partMaterialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material no encontrado con el ID: " + id));

        if (updatedMaterial.getMaterialName() == null || updatedMaterial.getMaterialName().isEmpty()) {
            throw new IllegalArgumentException("El nombre del material no puede estar vacío.");
        }

        existingMaterial.setMaterialName(updatedMaterial.getMaterialName());
        return partMaterialRepository.save(existingMaterial);
    }

    // Eliminar un material
    public void deleteMaterial(Long id) {
        if (!partMaterialRepository.existsById(id)) {
            throw new RuntimeException("Material no encontrado con el ID: " + id);
        }
        partMaterialRepository.deleteById(id);
    }
}
