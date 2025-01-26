package com.QS.AppQuickSolutions.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.PartDto;
import com.QS.AppQuickSolutions.dto.ProjectDto;
import com.QS.AppQuickSolutions.dto.ProjectWithPartsDto;
import com.QS.AppQuickSolutions.entity.Project;
import com.QS.AppQuickSolutions.services.ProjectService;

@RestController
@RequestMapping("/api/project")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    // Crear un nuevo proyecto junto con sus piezas
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<?> createProjectWithParts(@RequestBody ProjectWithPartsDto projectWithPartsDto) {
         try {
             projectService.createProjectWithParts(projectWithPartsDto.getProject(), projectWithPartsDto.getParts());
             return ResponseEntity.ok("Proyecto creado con éxito.");
         } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                  .body("Error al crear el proyecto: " + e.getMessage());
         }
    }
 
    // Obtener todos los proyectos
     @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
     @GetMapping("/list")
     public ResponseEntity<List<Project>> getAllProjects() {
         return ResponseEntity.ok(projectService.getAllProjects());
    }
 
    // Obtener un proyecto por ID
     @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
     @GetMapping("/{id}")
     public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
         return ResponseEntity.ok(projectService.getProjectById(id));
    }
 
    // Actualizar un proyecto parcialmente (con PATCH)
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @PatchMapping("/{id}/update")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody ProjectDto projectDto) {
        try {
            Project updatedProject = projectService.updateProject(id, projectDto);
            return ResponseEntity.ok(updatedProject);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al actualizar el proyecto: " + e.getMessage());
        }
    }
 
    // Eliminar un proyecto
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
         try {
             projectService.deleteProject(id);
             return ResponseEntity.noContent().build();
         } catch (Exception e) {
             return ResponseEntity.status(500).body("Error al eliminar el proyecto: " + e.getMessage());
         }
    }
 

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @GetMapping("/{id}/parts")
    public ResponseEntity<List<PartDto>> getPartsByProject(@PathVariable Long id) {
        try {
            List<PartDto> parts = projectService.getPartsByProject(id);
            return ResponseEntity.ok(parts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // private ProjectDto convertToDto(Project project) {
    //     ProjectDto dto = new ProjectDto();
        
    //     dto.setClientAlias(project.getClientAlias());
    //     dto.setContact(project.getContact());
    //     dto.setVisitDateTime(project.getVisitDateTime());
    //     dto.setVisitStatus(project.getVisitStatus());
    //     dto.setDevelopmentStatus(project.getDevelopmentStatus());
    //     dto.setInFolder(project.getInFolder());
    //     dto.setInstallationDateTime(project.getInstallationDateTime());
    //     dto.setCreatedDate(project.getCreatedDate());
    //     dto.setState(project.getState());
    //     dto.setParts(project.getParts().stream().map(part -> {
    //         PartDto partDto = new PartDto();
    //         partDto.setCustomPart(part.getCustomPart());
    //         partDto.setPartMaterial(part.getPartMaterial());
    //         partDto.setTotalweightKg(part.getTotalweightKg());
    //         partDto.setSheetThicknessMm(part.getSheetThicknessMm());
    //         partDto.setLengthPiecesMm(part.getLengthPiecesMm());
    //         partDto.setHeightMm(part.getHeightMm());
    //         partDto.setWidthMm(part.getWidthMm());
    //         partDto.setQrCodeData(part.getQrCodeData());
    //         partDto.setQrCodeFilePath(part.getQrCodeFilePath());
    //         partDto.setScanDateTime(part.getScanDateTime());
    //         partDto.setQualityControlState(part.getQualityControlState());
    //         partDto.setPartState(part.getPartState());
    //         partDto.setObservations(part.getObservations());
    //         return partDto;
    //     }).collect(Collectors.toList()));
    //     return dto;
    // }
    
}
