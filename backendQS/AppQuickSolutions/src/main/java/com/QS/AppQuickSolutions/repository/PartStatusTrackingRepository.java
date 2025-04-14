package com.QS.AppQuickSolutions.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.PartStatusTracking;
import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.enums.PartState;

@Repository
public interface PartStatusTrackingRepository extends JpaRepository<PartStatusTracking, Long> {

    // Buscar un seguimiento activo (no completado) por pieza y operario
    Optional<PartStatusTracking> findByPartAndUserOperatorAndIsCompletedFalse(Part part, User userOperator);

    // Buscar todos los seguimientos completados por operario (historial)
    List<PartStatusTracking> findByUserOperatorAndIsCompletedTrue(User userOperator);
                 
    // buscar si el operario tiene una pieza en proceso
    List<PartStatusTracking> findByUserOperatorAndIsCompletedFalse(User userOperator);

    // Buscar todos los seguimientos de una pieza específica
    List<PartStatusTracking> findByPart(Part part);

    // Buscar piezas por categoría (PartState) que no estén completadas
    List<PartStatusTracking> findByPartStateAndIsCompletedFalse(PartState partState);

    Optional<PartStatusTracking> findByPartAndIsCompletedFalse(Part part);
}