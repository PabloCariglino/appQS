package com.QS.AppQuickSolutions.controller;

import java.util.List;

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

import com.QS.AppQuickSolutions.dto.ProjectDto;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.Project;
import com.QS.AppQuickSolutions.services.PartService;
import com.QS.AppQuickSolutions.services.ProjectService;

@RestController
@RequestMapping("/api/project")
public class ProjectController {
    
    @Autowired
    private PartService partService;

    @Autowired
    private ProjectService projectService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/projects-create") // Cambiado para evitar duplicados
    public ResponseEntity<Project> createProject(@RequestBody ProjectDto projectDto) {
        Project project = projectService.createProject(projectDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/projects-update/{id}") // Cambiado para evitar duplicados
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody ProjectDto projectDto) {
        Project project = projectService.updateProject(id, projectDto);
        return ResponseEntity.ok(project);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        Project project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    @GetMapping("/projects-list") // Cambiado para evitar duplicados
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/projects-delete/{id}") // Cambiado para evitar duplicados
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/projects/{projectId}/parts")
    public ResponseEntity<List<Part>> getPartsByProject(@PathVariable Long projectId) {
    List<Part> parts = partService.getPartsByProject(projectId);
    return ResponseEntity.ok(parts);
}

}
