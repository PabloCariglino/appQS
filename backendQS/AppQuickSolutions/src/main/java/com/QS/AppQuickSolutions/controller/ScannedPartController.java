package com.QS.AppQuickSolutions.controller;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.entity.ScannedPart;
import com.QS.AppQuickSolutions.repository.ScannedPartRepository;

@RestController
@RequestMapping("/api/scanned-parts")
public class ScannedPartController {
    @Autowired
    private ScannedPartRepository scannedPartRepository;

    @PostMapping
    public ResponseEntity<ScannedPart> saveScannedPart(@RequestBody ScannedPart scannedPart) {
        return ResponseEntity.ok(scannedPartRepository.save(scannedPart));
    }

    @GetMapping
    public ResponseEntity<List<ScannedPart>> getScannedParts() {
        LocalDateTime twoMonthsAgo = LocalDateTime.now().minus(2, ChronoUnit.MONTHS);
        List<ScannedPart> scannedParts = scannedPartRepository.findByScanDateTimeAfter(twoMonthsAgo);
        return ResponseEntity.ok(scannedParts);
    }
}