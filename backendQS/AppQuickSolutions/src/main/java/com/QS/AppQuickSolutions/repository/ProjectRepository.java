package com.QS.AppQuickSolutions.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.QS.AppQuickSolutions.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Aquí puedes agregar métodos de consulta personalizados si los necesitas
    // Optional<Project> findByProjectName(String projectName);
    
    List<Project> findByClientAlias(String clientAlias);

    


    
}

