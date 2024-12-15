package com.QS.AppQuickSolutions.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.QS.AppQuickSolutions.entity.CustomPart;

@Repository
public interface CustomPartRepository extends JpaRepository <CustomPart, Long>{
    
}
