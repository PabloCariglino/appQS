package com.QS.AppQuickSolutions.services;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.dto.PartDto;
import com.QS.AppQuickSolutions.dto.ProjectDto;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.Project;
import com.QS.AppQuickSolutions.repository.PartRepository;
import com.QS.AppQuickSolutions.repository.ProjectRepository;
import com.google.zxing.WriterException;

import io.jsonwebtoken.io.IOException;
import jakarta.transaction.Transactional;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PartService partService;

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private QRCodeService qrCodeService;

    @Transactional
    public Project createProjectWithParts(ProjectDto projectDto, List<PartDto> partDtos) throws WriterException, IOException, java.io.IOException {
        
        // Convertir el DTO del proyecto a la entidad Project
        Project project = new Project();
        project.setClientAlias(projectDto.getClientAlias());
        project.setContact(projectDto.getContact());
        project.setCreatedDate(new Date());
        project.setVisitDateTime(projectDto.getVisitDateTime());
        project.setVisitStatus(projectDto.getVisitStatus());
        project.setDevelopmentStatus(projectDto.getDevelopmentStatus());
        project.setInFolder(projectDto.getInFolder());
        project.setInstallationDateTime(projectDto.getInstallationDateTime());
        project.setState(projectDto.getState());
       

        // Guardar el proyecto primero
        Project savedProject = projectRepository.save(project);

        // Crear y guardar las piezas asociadas al proyecto
        for (PartDto partDto : partDtos) {
            Part part = new Part();
            part.setProject(savedProject); // Asignar el proyecto guardado
            populatePartData(part, partDto);

            // Generar el código QR para la pieza
            String qrData = generateQrData(part);
            String qrFilePath = qrCodeService.generateQRCodeImage(qrData, 300, 300, UUID.randomUUID() + "_part_qr.png");
            part.setQrCodeFilePath(qrFilePath);

            partRepository.save(part); // Guardar la pieza con el QR
        }

        return savedProject; // Retornar el proyecto con las piezas asociadas
    }

    // Obtener todos los proyectos
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // Obtener proyecto por ID
    public Project getProjectById(Long id) {
        return projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Proyecto no encontrado"));
    }

    // Actualización parcial del proyecto
    public Project updateProject(Long id, ProjectDto projectDto) throws java.io.IOException, WriterException {
        Project existingProject = getProjectById(id);

        if (projectDto.getClientAlias() != null) existingProject.setClientAlias(projectDto.getClientAlias());
        if (projectDto.getContact() != null) existingProject.setContact(projectDto.getContact());
        if (projectDto.getVisitDateTime() != null) existingProject.setVisitDateTime(projectDto.getVisitDateTime());
        if (projectDto.getVisitStatus() != null) existingProject.setVisitStatus(projectDto.getVisitStatus());
        if (projectDto.getDevelopmentStatus() != null) existingProject.setDevelopmentStatus(projectDto.getDevelopmentStatus());
        if (projectDto.getInFolder() != null) existingProject.setInFolder(projectDto.getInFolder());
        if (projectDto.getInstallationDateTime() != null) existingProject.setInstallationDateTime(projectDto.getInstallationDateTime());
        if (projectDto.getState() != null) existingProject.setState(projectDto.getState());

        // Actualizar las piezas si es necesario
        if (projectDto.getParts() != null && !projectDto.getParts().isEmpty()) {
            for (PartDto partDto : projectDto.getParts()) {
                // Actualizar las piezas asociadas al proyecto
                partService.updatePart(partDto.getId(), partDto);
            }
        }

        return projectRepository.save(existingProject);
    }


    // Eliminar un proyecto
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    private void populatePartData(Part part, PartDto partDto) {
        part.setCustomPart(partDto.getCustomPart());
        part.setPartMaterial(partDto.getPartMaterial());
        part.setTotalweightKg(partDto.getTotalweightKg());
        part.setSheetThicknessMm(partDto.getSheetThicknessMm());
        part.setLengthPiecesMm(partDto.getLengthPiecesMm());
        part.setHeightMm(partDto.getHeightMm());
        part.setWidthMm(partDto.getWidthMm());
        part.setObservations(partDto.getObservations());
        part.setPartState(partDto.getPartState());
        part.setQualityControlState(partDto.getQualityControlState());
        part.setScanDateTime(LocalDateTime.now());
    }

    private String generateQrData(Part part) {
        return "Part ID: " + part.getId() +
                "\nCustomPart: " + part.getCustomPart().getCustomPart() +
                "\nMaterial: " + part.getPartMaterial().getMaterialName();
    }
    

   

    // private void updateProjectDetails(Project project, ProjectDto projectDto) {
    //     project.setClientAlias(projectDto.getClientAlias());
    //     project.setContact(projectDto.getContact());
    //     project.setState(projectDto.getState());
    //     project.setVisitDateTime(projectDto.getVisitDateTime());
    //     project.setVisitStatus(project.getVisitStatus());
    //     project.setDevelopmentStatus(project.getDevelopmentStatus());
    //     project.setInFolder(project.getInFolder());
    //     project.setInstallationDateTime(projectDto.getInstallationDateTime());
    // }

    // Devuelve la lista de parts de un project
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
            partDto.setQrCodeData(part.getQrCodeData());
            partDto.setQrCodeFilePath(part.getQrCodeFilePath());
            partDto.setScanDateTime(part.getScanDateTime());
            partDto.setQualityControlState(part.getQualityControlState());
            partDto.setPartState(part.getPartState());
            partDto.setObservations(part.getObservations());
            return partDto;
        }).collect(Collectors.toList());
    }
    


    // private List<Part> createPartsForProject(Project project, List<PartDto> partDtos) {
    //     if (partDtos == null || partDtos.isEmpty()) {
    //         return List.of();
    //     }

    //     return partDtos.stream()
    //             .map(partDto -> {
    //                 try {
    //                     return partService.createPart(project, partDto);
    //                 } catch (Exception e) {
    //                     throw new RuntimeException("Error al crear piezas para el proyecto: " + e.getMessage(), e);
    //                 }
    //             })
    //             .collect(Collectors.toList());
    // }

    private void validateProjectDto(ProjectDto projectDto) {
       
        if (projectDto.getClientAlias() == null || projectDto.getClientAlias().isBlank()) {
            throw new IllegalArgumentException("El alias del cliente no puede estar vacío.");
        }
        if (projectDto.getContact() == null) {
            throw new IllegalArgumentException("El contacto no puede estar vacío.");
        }
        

    }
}
