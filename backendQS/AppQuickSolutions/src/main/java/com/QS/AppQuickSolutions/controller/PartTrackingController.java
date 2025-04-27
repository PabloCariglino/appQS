package com.QS.AppQuickSolutions.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.OperatorMetricsDTO;
import com.QS.AppQuickSolutions.dto.PartTrackingSummaryDTO;
import com.QS.AppQuickSolutions.entity.PartStatusTracking;
import com.QS.AppQuickSolutions.services.PartTrackingService;

@RestController
@RequestMapping("/api/part-tracking")
public class PartTrackingController {
    @Autowired
    private PartTrackingService partTrackingService;

    @PostMapping("/take/{partId}/{userId}")
    public ResponseEntity<PartTrackingSummaryDTO> takePart(
            @PathVariable UUID partId,
            @PathVariable Long userId) {
        PartStatusTracking tracking = partTrackingService.takePart(partId, userId);
        PartTrackingSummaryDTO dto = new PartTrackingSummaryDTO();
        dto.setTrackingId(tracking.getId());
        dto.setPartId(tracking.getPart().getId());
        dto.setProjectId(tracking.getPart().getProject().getId());
        dto.setPartName(tracking.getPart().getCustomPart().getCustomPartName());
        dto.setPartState(tracking.getPartState()); // Mantenemos PartState
        dto.setScanDateTime(tracking.getPart().getScanDateTime());
        dto.setStartTime(tracking.getStartTime());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/complete/{partId}/{userId}")
    public ResponseEntity<PartTrackingSummaryDTO> completePart(
            @PathVariable UUID partId,
            @PathVariable Long userId) {
        PartStatusTracking tracking = partTrackingService.completePart(partId, userId);
        PartTrackingSummaryDTO dto = new PartTrackingSummaryDTO();
        dto.setTrackingId(tracking.getId());
        dto.setPartId(tracking.getPart().getId());
        dto.setProjectId(tracking.getPart().getProject().getId());
        dto.setPartName(tracking.getPart().getCustomPart().getCustomPartName());
        dto.setPartState(tracking.getPartState()); // Mantenemos PartState
        dto.setScanDateTime(tracking.getPart().getScanDateTime());
        dto.setStartTime(tracking.getStartTime());
        dto.setEndTime(tracking.getEndTime());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<PartTrackingSummaryDTO>> getUserHistory(
            @PathVariable Long userId) {
        List<PartStatusTracking> history = partTrackingService.getTrackingHistory(userId);
        List<PartTrackingSummaryDTO> dtos = history.stream().map(tracking -> {
            PartTrackingSummaryDTO dto = new PartTrackingSummaryDTO();
            dto.setTrackingId(tracking.getId());
            dto.setPartId(tracking.getPart().getId());
            dto.setProjectId(tracking.getPart().getProject().getId());
            dto.setPartName(tracking.getPart().getCustomPart().getCustomPartName());
            dto.setPartState(tracking.getPartState()); // Mantenemos PartState
            dto.setScanDateTime(tracking.getPart().getScanDateTime());
            dto.setStartTime(tracking.getStartTime());
            dto.setEndTime(tracking.getEndTime());
            dto.setCompleted(tracking.isCompleted());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/active/{userId}")
    public ResponseEntity<List<PartTrackingSummaryDTO>> getActiveTasks(
            @PathVariable Long userId) {
        List<PartStatusTracking> activeTasks = partTrackingService.getActiveTasks(userId);
        List<PartTrackingSummaryDTO> dtos = activeTasks.stream().map(tracking -> {
            PartTrackingSummaryDTO dto = new PartTrackingSummaryDTO();
            dto.setTrackingId(tracking.getId());
            dto.setPartId(tracking.getPart().getId());
            dto.setProjectId(tracking.getPart().getProject().getId());
            dto.setPartName(tracking.getPart().getCustomPart().getCustomPartName());
            dto.setPartState(tracking.getPartState()); // Mantenemos PartState
            dto.setScanDateTime(tracking.getPart().getScanDateTime());
            dto.setStartTime(tracking.getStartTime());
            dto.setEndTime(tracking.getEndTime());
            dto.setCompleted(tracking.isCompleted());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/metrics/{userId}")
    public ResponseEntity<OperatorMetricsDTO> getUserMetrics(
            @PathVariable Long userId) {
        OperatorMetricsDTO metrics = partTrackingService.getUserMetrics(userId);
        return ResponseEntity.ok(metrics);
    }
}