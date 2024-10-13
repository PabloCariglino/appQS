package com.QS.AppQuickSolutions.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.dto.PartDto;
import com.QS.AppQuickSolutions.dto.ProjectDto;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.Project;
import com.QS.AppQuickSolutions.enums.Material;
import com.QS.AppQuickSolutions.enums.PartName;
import com.QS.AppQuickSolutions.repository.ProjectRepository;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public Project createProject(ProjectDto projectDto) {
        Project project = new Project();
        project.setProjectName(projectDto.getProjectName());
        project.setClientAlias(projectDto.getClientAlias());
        project.setContact(projectDto.getContact());
        project.setState(projectDto.getState());

        List<Part> parts = projectDto.getParts().stream().map(this::convertToEntity).collect(Collectors.toList());
        project.setParts(parts);
        parts.forEach(part -> part.setProject(project));

        return projectRepository.save(project);
    }

    // Método para obtener un proyecto por ID
    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id " + id));
    }

    public Project updateProject(Long id, ProjectDto projectDto) {
        Project existingProject = projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        existingProject.setProjectName(projectDto.getProjectName());
        existingProject.setClientAlias(projectDto.getClientAlias());
        existingProject.setContact(projectDto.getContact());
        existingProject.setState(projectDto.getState());

        return projectRepository.save(existingProject);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    private Part convertToEntity(PartDto partDto) {
        Part part = new Part();
        part.setPartName(PartName.valueOf(partDto.getPartName()));
        part.setMaterial(Material.valueOf(partDto.getMaterial()));
        part.setTotalweightKg(partDto.getTotalweightKg());
        part.setSheetThicknessMm(partDto.getSheetThicknessMm());
        part.setLengthPiecesMm(partDto.getLengthPiecesMm());
        part.setHeightMm(partDto.getHeightMm());
        part.setWidthMm(partDto.getWidthMm());
        part.setScanDateTime(partDto.getScanDateTime());
        part.setReceptionState(partDto.getReceptionState());
        part.setQualityControlState(partDto.getQualityControlState());
        part.setObservations(partDto.getObservations());

        return part;
    }
}

