package com.QS.AppQuickSolutions.controller;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.QS.AppQuickSolutions.entity.CustomPart;
import com.QS.AppQuickSolutions.services.CustomPartService;

import io.jsonwebtoken.io.IOException;

@RestController
@RequestMapping("/api/images")
public class ImageCustomPartController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private CustomPartService customPartService;
    /**
     * Endpoint para servir imágenes desde el servidor.
     *
     * @param filename El nombre del archivo (incluido en la ruta de la imagen).
     * @return La imagen como recurso si existe, o un 404 si no se encuentra.
     */
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            // Construir la ruta completa del archivo
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            // Verificar si el archivo existe y es legible
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Determinar el tipo de contenido de la imagen
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE; // Predeterminado
            }

            // Retornar la imagen como recurso
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            // En caso de error en la URL del recurso
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            // Otros errores posibles
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
@PostMapping("/{id}/upload-image")
public ResponseEntity<CustomPart> uploadImage(
        @PathVariable Long id,
        @RequestParam("image") MultipartFile image) throws IOException, java.io.IOException {
    CustomPart updatedPart = customPartService.uploadImage(id, image);
    return ResponseEntity.ok(updatedPart);
}

}
