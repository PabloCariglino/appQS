package com.QS.AppQuickSolutions.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.dto.PartDto;
import com.QS.AppQuickSolutions.dto.ProjectDto;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.Project;
import com.QS.AppQuickSolutions.repository.ProjectRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PartService partService;

    public Project createProject(ProjectDto projectDto) {
        validateProjectDto(projectDto);

        Project project = new Project();
        updateProjectDetails(project, projectDto);

        List<Part> parts = createPartsForProject(project, projectDto.getParts());
        project.setParts(parts);

        return projectRepository.save(project);
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proyecto no encontrado con ID: " + id));
    }

    public Project updateProject(Long id, ProjectDto projectDto) {
        validateProjectDto(projectDto);

        Project existingProject = getProjectById(id);
        updateProjectDetails(existingProject, projectDto);

        // Actualizar las piezas asociadas
        List<Part> updatedParts = createPartsForProject(existingProject, projectDto.getParts());
        existingProject.getParts().clear();
        existingProject.getParts().addAll(updatedParts);

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

    private List<Part> createPartsForProject(Project project, List<PartDto> partDtos) {
        if (partDtos == null || partDtos.isEmpty()) {
            return List.of();
        }

        return partDtos.stream()
                .map(partDto -> {
                    try {
                        return partService.createPart(project, partDto);
                    } catch (Exception e) {
                        throw new RuntimeException("Error al crear piezas para el proyecto: " + e.getMessage(), e);
                    }
                })
                .collect(Collectors.toList());
    }

    private void validateProjectDto(ProjectDto projectDto) {
        if (projectDto.getProjectName() == null || projectDto.getProjectName().isBlank()) {
            throw new IllegalArgumentException("El nombre del proyecto no puede estar vacío.");
        }
        if (projectDto.getClientAlias() == null || projectDto.getClientAlias().isBlank()) {
            throw new IllegalArgumentException("El alias del cliente no puede estar vacío.");
        }
        if (projectDto.getContact() == null) {
            throw new IllegalArgumentException("El contacto no puede estar vacío.");
        }
    }

    private void updateProjectDetails(Project project, ProjectDto projectDto) {
        project.setProjectName(projectDto.getProjectName());
        project.setClientAlias(projectDto.getClientAlias());
        project.setContact(projectDto.getContact());
        project.setState(projectDto.getState());
    }

    public List<PartDto> getPartsByProject(Long projectId) {
        Project project = getProjectById(projectId); // Usa el método existente para obtener el proyecto
        return project.getParts().stream().map(part -> {
            PartDto partDto = new PartDto();
            partDto.setCustomPart(part.getCustomPart());
            partDto.setPartMaterial(part.getPartMaterial());
            partDto.setTotalweightKg(part.getTotalweightKg());
            partDto.setSheetThicknessMm(part.getSheetThicknessMm());
            partDto.setLengthPiecesMm(part.getLengthPiecesMm());
            partDto.setHeightMm(part.getHeightMm());
            partDto.setWidthMm(part.getWidthMm());
            partDto.setReceptionState(part.getReceptionState());
            partDto.setQualityControlState(part.getQualityControlState());
            partDto.setObservations(part.getObservations());
            return partDto;
        }).collect(Collectors.toList());
    }
    
}
