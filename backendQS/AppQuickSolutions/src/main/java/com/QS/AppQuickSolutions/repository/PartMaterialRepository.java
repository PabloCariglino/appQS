package com.QS.AppQuickSolutions.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.QS.AppQuickSolutions.entity.PartMaterial;

@Repository
public interface PartMaterialRepository extends JpaRepository <PartMaterial, Long>{
    
}
