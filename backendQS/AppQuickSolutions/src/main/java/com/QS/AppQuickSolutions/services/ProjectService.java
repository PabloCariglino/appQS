package com.QS.AppQuickSolutions.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.dto.ProjectDto;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.Project;
import com.QS.AppQuickSolutions.repository.ProjectRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public Project createProject(ProjectDto projectDto) {
        Project project = convertToEntity(projectDto);
        return projectRepository.save(project);
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proyecto no encontrado con ID: " + id));
    }

    public Project updateProject(Long id, ProjectDto projectDto) {
        Project existingProject = getProjectById(id);
        updateProjectDetails(existingProject, projectDto);
        return projectRepository.save(existingProject);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new EntityNotFoundException("Proyecto no encontrado con ID: " + id);
        }
        projectRepository.deleteById(id);
    }

    private Project convertToEntity(ProjectDto projectDto) {
        Project project = new Project();
        updateProjectDetails(project, projectDto);

        List<Part> parts = projectDto.getParts().stream()
                .map(partDto -> {
                    Part part = new Part();
                    // Configurar las partes según el DTO
                    part.setProject(project);
                    part.setTotalweightKg(partDto.getTotalweightKg());
                    part.setSheetThicknessMm(partDto.getSheetThicknessMm());
                    return part;
                })
                .collect(Collectors.toList());

        project.setParts(parts);
        return project;
    }

    private void updateProjectDetails(Project project, ProjectDto projectDto) {
        project.setProjectName(projectDto.getProjectName());
        project.setClientAlias(projectDto.getClientAlias());
        project.setContact(projectDto.getContact());
        project.setState(projectDto.getState());
    }
}
