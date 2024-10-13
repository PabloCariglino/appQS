package com.QS.AppQuickSolutions.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.PartDto;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.security.SecurityUtils;
import com.QS.AppQuickSolutions.services.PartService;
import com.QS.AppQuickSolutions.services.UserService;

@RestController
@RequestMapping("/api/part")
public class PartController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private PartService partService;

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @PutMapping("/parts/{id}") // Cambiado para evitar duplicados
    public ResponseEntity<Part> updatePart(@PathVariable UUID id, @RequestBody PartDto partDto) {
        String currentUserEmail = SecurityUtils.getCurrentAuthenticatedEmail(); // Obtiene el email del usuario autenticado
        User currentUser = userService.findUserByEmail(currentUserEmail); // Busca al usuario por su email
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Part part = partService.updatePart(id, partDto, currentUser);
        return ResponseEntity.ok(part);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @GetMapping("/parts-list") // Cambiado para evitar duplicados
    public ResponseEntity<List<Part>> getAllParts() {
        List<Part> parts = partService.getAllParts();
        return ResponseEntity.ok(parts);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/parts-delete/{id}") // Cambiado para evitar duplicados
    public ResponseEntity<Void> deletePart(@PathVariable UUID id) {
        partService.deletePart(id);
        return ResponseEntity.noContent().build();
    }
}
