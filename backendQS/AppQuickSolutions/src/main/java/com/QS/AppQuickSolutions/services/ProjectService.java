package com.QS.AppQuickSolutions.services;

import java.util.Date;
import java.util.List;
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
    public Project createProjectWithParts(ProjectDto projectDto, List<PartDto> partDtos) throws IOException, WriterException, java.io.IOException {
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
    
        // Guardar el proyecto primero para obtener su ID
        Project savedProject = projectRepository.save(project);
    
        // Crear y guardar cada pieza con el proyecto persistido, generando QR completo
        for (PartDto partDto : partDtos) {
            Part part = partService.createPart(savedProject, partDto); // Usar createPart sin QR

            // Generar el QR usando la pieza persistida con Project ID
            String qrData = qrCodeService.generateQrDataFromPart(part);
            String qrFilePath = qrCodeService.generateQRCodeImage(qrData, 300, 300, part.getId() + "_part_qr.png");
            part.setQrCodeData(qrData);
            part.setQrCodeFilePath(qrFilePath);
    
            partRepository.save(part); // Guardar la pieza con el QR completo
        }
    
        // Retornar la respuesta directa sin ApiResponse
        return savedProject;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Proyecto no encontrado"));
    }

    public Project updateProject(Long id, ProjectDto projectDto) throws IOException, WriterException, java.io.IOException {
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
                partService.updatePart(partDto.getId(), partDto);
            }
        }
        return projectRepository.save(existingProject);
    }

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
        part.setReceptionState(false); // Inicializar explícitamente en false
        part.setScanDateTime(null); // Valor por defecto
        part.setReadyForDelivery(false);
    }

    public List<PartDto> getPartsByProject(Long projectId) {
        Project project = getProjectById(projectId);
        return project.getParts().stream().map(part -> {
            PartDto partDto = new PartDto();

            partDto.setId(part.getId());
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
            partDto.setReceptionState(part.getReceptionState());
            partDto.setReadyForDelivery(part.isReadyForDelivery());
            
           
            return partDto;
        }).collect(Collectors.toList());
    }
}