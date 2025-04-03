package com.QS.AppQuickSolutions.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.QS.AppQuickSolutions.entity.ScannedPart;

@Repository
public interface ScannedPartRepository extends JpaRepository<ScannedPart, Long> {
    List<ScannedPart> findByScanDateTimeAfter(LocalDateTime dateTime);
}
