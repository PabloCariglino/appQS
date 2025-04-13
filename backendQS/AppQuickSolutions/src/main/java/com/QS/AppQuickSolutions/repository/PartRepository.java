package com.QS.AppQuickSolutions.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.Project;

@Repository
public interface PartRepository extends JpaRepository<Part, UUID> {

    // Métodos de consulta personalizados si son necesarios
    List<Part> findByProject(Project project);
    
    Optional<Part> findByQrCodeData(String qrCodeData);

    List<Part> findByProjectId(Long projectId); // Método para encontrar partes por ID de proyecto

    Optional<Part> findById(UUID partId);

    

}

