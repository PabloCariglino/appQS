package com.QS.AppQuickSolutions.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
import com.QS.AppQuickSolutions.dto.ProjectDto;
import com.QS.AppQuickSolutions.entity.Project;
import com.QS.AppQuickSolutions.services.ProjectService;

@RestController
@RequestMapping("/api/project")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<ProjectDto> createProject(@RequestBody ProjectDto projectDto) {
        try {
            Project project = projectService.createProject(projectDto);
            ProjectDto responseDto = convertToDto(project);
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/update")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @RequestBody ProjectDto projectDto) {
        try {
            Project project = projectService.updateProject(id, projectDto);
            ProjectDto responseDto = convertToDto(project);
            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        try {
            Project project = projectService.getProjectById(id);
            ProjectDto responseDto = convertToDto(project);
            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @GetMapping("/list")
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        try {
            List<Project> projects = projectService.getAllProjects();
            List<ProjectDto> projectDtos = projects.stream().map(this::convertToDto).collect(Collectors.toList());
            return ResponseEntity.ok(projectDtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        try {
            projectService.deleteProject(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

    private ProjectDto convertToDto(Project project) {
        ProjectDto dto = new ProjectDto();
        dto.setProjectName(project.getProjectName());
        dto.setClientAlias(project.getClientAlias());
        dto.setContact(project.getContact());
        dto.setState(project.getState());
        dto.setParts(project.getParts().stream().map(part -> {
            PartDto partDto = new PartDto();
            partDto.setCustomPart(part.getCustomPart());
            partDto.setPartMaterial(part.getPartMaterial());
            partDto.setTotalweightKg(part.getTotalweightKg());
            partDto.setSheetThicknessMm(part.getSheetThicknessMm());
            partDto.setLengthPiecesMm(part.getLengthPiecesMm());
            partDto.setHeightMm(part.getHeightMm());
            partDto.setWidthMm(part.getWidthMm());
            partDto.setObservations(part.getObservations());
            return partDto;
        }).collect(Collectors.toList()));
        return dto;
    }
}
