package com.QS.AppQuickSolutions.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.QS.AppQuickSolutions.entity.CustomPart;
import com.QS.AppQuickSolutions.repository.CustomPartRepository;

@RestController
@RequestMapping("/api/customParts")
public class CustomPartController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final CustomPartRepository customPartRepository;

    public CustomPartController(CustomPartRepository customPartRepository) {
        this.customPartRepository = customPartRepository;
    }

    @GetMapping
    public List<CustomPart> getAllCustomParts() {
        return customPartRepository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public CustomPart createCustomPart(@RequestParam("customPart") String customPartName,
                                       @RequestParam("image") MultipartFile image) throws IOException {
        // Generar un nombre único para la imagen
        String imageName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        Path imagePath = Paths.get(uploadDir, imageName);

        // Crear el directorio si no existe
        Files.createDirectories(imagePath.getParent());

        // Guardar la imagen en el sistema de archivos
        Files.copy(image.getInputStream(), imagePath);

        // Guardar la pieza personalizada en la base de datos
        CustomPart customPart = new CustomPart();
        customPart.setCustomPart(customPartName);
        customPart.setImageFilePath(imageName);

        return customPartRepository.save(customPart);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteCustomPart(@PathVariable Long id) {
        customPartRepository.deleteById(id);
    }
}
