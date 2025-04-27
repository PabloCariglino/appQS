package com.QS.AppQuickSolutions.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.PartsByStateDTO;
import com.QS.AppQuickSolutions.services.PartStateService;

@RestController
@RequestMapping("/api/parts")
public class PartStateController {
    @Autowired
    private PartStateService partStateService;

    @GetMapping("/by-state")
    public ResponseEntity<List<PartsByStateDTO>> getPartsByState() {
        List<PartsByStateDTO> partsByState = partStateService.getPartsByState();
        return ResponseEntity.ok(partsByState);
    }
}