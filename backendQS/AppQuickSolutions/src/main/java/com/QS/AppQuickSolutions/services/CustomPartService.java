package com.QS.AppQuickSolutions.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.QS.AppQuickSolutions.entity.CustomPart;
import com.QS.AppQuickSolutions.repository.CustomPartRepository;

@Service
public class CustomPartService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final CustomPartRepository customPartRepository;

    public CustomPartService(CustomPartRepository customPartRepository) {
        this.customPartRepository = customPartRepository;
    }

    // Obtener todas las piezas personalizadas
    public List<CustomPart> getAllCustomParts() {
        return customPartRepository.findAll();
    }

    // Obtener una pieza personalizada por ID
    public CustomPart getCustomPartById(Long id) {
        return customPartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom Part not found with id: " + id));
    }

    // Crear una nueva pieza personalizada
    public CustomPart createCustomPart(String customPartName, MultipartFile image) throws IOException {
        CustomPart customPart = new CustomPart();
        customPart.setCustomPart(customPartName);

        if (image != null && !image.isEmpty()) {
            String imageName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path imagePath = Paths.get(uploadDir, imageName);
            Files.createDirectories(imagePath.getParent());
            Files.copy(image.getInputStream(), imagePath);
            customPart.setImageFilePath(imageName);
        }

        return customPartRepository.save(customPart);
    }

    // Actualizar una pieza personalizada existente
    public CustomPart updateCustomPart(Long id, String customPartName, MultipartFile image) throws IOException {
        CustomPart existingPart = customPartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom Part not found with id: " + id));
    
        // Actualiza el nombre solo si se proporciona
        if (customPartName != null && !customPartName.isEmpty()) {
            existingPart.setCustomPart(customPartName);
        }
    
        // Actualiza la imagen solo si se proporciona
        if (image != null && !image.isEmpty()) {
            String imageName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path imagePath = Paths.get(uploadDir, imageName);
    
            // Crear el directorio si no existe
            Files.createDirectories(imagePath.getParent());
    
            // Guardar la nueva imagen en el sistema de archivos
            Files.copy(image.getInputStream(), imagePath);
    
            // Actualizar la ruta de la imagen
            existingPart.setImageFilePath(imageName);
        }
    
        return customPartRepository.save(existingPart);
    }
    
    

    // Eliminar una pieza personalizada
    public void deleteCustomPart(Long id) {
        CustomPart customPart = customPartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom Part not found with id: " + id));
        try {
            deleteImageFile(customPart.getImageFilePath());
        } catch (IOException e) {
            throw new RuntimeException("Error deleting associated image file.", e);
        }
        customPartRepository.delete(customPart);
    }

    // Subir una imagen para una pieza personalizada existente
    public CustomPart uploadImage(Long id, MultipartFile image) throws IOException {
        CustomPart customPart = customPartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom part not found."));
        if (image != null && !image.isEmpty()) {
            String imageName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path imagePath = Paths.get(uploadDir, imageName);
            Files.createDirectories(imagePath.getParent());
            Files.copy(image.getInputStream(), imagePath);
            customPart.setImageFilePath(imageName);
        }
        return customPartRepository.save(customPart);
    }

    // Validar el nombre de la pieza personalizada
    // private void validateCustomPartName(String customPartName) {
    //     if (customPartName == null || customPartName.trim().isEmpty()) {
    //         throw new IllegalArgumentException("El nombre de la pieza personalizada no puede estar vacío.");
    //     }
    // }

    // Guardar una imagen en el sistema de archivos
    // private String saveImage(MultipartFile image) throws IOException {
    //     String imageName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
    //     Path imagePath = Paths.get(uploadDir, imageName);
    //     Files.createDirectories(imagePath.getParent());
    //     Files.copy(image.getInputStream(), imagePath);
    //     return imageName;
    // }

    // Eliminar un archivo de imagen del sistema de archivos
    private void deleteImageFile(String imageFilePath) throws IOException {
        if (imageFilePath != null && !imageFilePath.isEmpty()) {
            Path filePath = Paths.get(uploadDir, imageFilePath);
            Files.deleteIfExists(filePath);
        }
    }
}
