package com.QS.AppQuickSolutions.controller;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.OperatorMetricsDTO;
import com.QS.AppQuickSolutions.dto.PartSummaryDTO;
import com.QS.AppQuickSolutions.dto.StatePartsDTO;
import com.QS.AppQuickSolutions.entity.PartStatusTracking;
import com.QS.AppQuickSolutions.enums.PartState;
import com.QS.AppQuickSolutions.services.PartStatusTrackingService;

@RestController
@RequestMapping("/api/part-tracking")
public class PartStatusTrackingController {

    private final PartStatusTrackingService partStatusTrackingService;

    public PartStatusTrackingController(PartStatusTrackingService partStatusTrackingService) {
        this.partStatusTrackingService = partStatusTrackingService;
    }

    @PostMapping("/start/{partId}/{operatorId}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<PartStatusTracking> startTracking(
            @PathVariable UUID partId, @PathVariable Long operatorId) {
        return ResponseEntity.ok(partStatusTrackingService.startTracking(partId, operatorId));
    }

    @PostMapping("/complete/{partId}/{operatorId}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<PartStatusTracking> completeTracking(
            @PathVariable UUID partId, @PathVariable Long operatorId) throws IOException {
        return ResponseEntity.ok(partStatusTrackingService.completeTracking(partId, operatorId));
    }

    @PostMapping("/manual-transition/{partId}/{operatorId}/{newState}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<PartStatusTracking> manualTransition(
            @PathVariable UUID partId, @PathVariable Long operatorId,
            @PathVariable PartState newState, @RequestParam String description) {
        return ResponseEntity.ok(partStatusTrackingService.manualTransition(partId, operatorId, newState, description));
    }

    // @GetMapping("/by-state/{partState}")
    // @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    // public ResponseEntity<List<PartStatusTracking>> getTrackingsByPartState(
    //         @PathVariable PartState partState) {
    //     return ResponseEntity.ok(partStatusTrackingService.getTrackingsByPartState(partState));
    // }

   

    @GetMapping("/by-project/{projectId}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<List<PartStatusTracking>> getTrackingsByProject(
            @PathVariable Long projectId) {
        return ResponseEntity.ok(partStatusTrackingService.getTrackingsByProject(projectId));
    }

    @GetMapping("/by-operator/{operatorId}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<List<PartStatusTracking>> getTrackingsByOperator(
            @PathVariable Long operatorId) {
        return ResponseEntity.ok(partStatusTrackingService.getTrackingsByOperator(operatorId));
    }

    @GetMapping("/operator-metrics/{operatorId}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<OperatorMetricsDTO> getOperatorMetrics(
            @PathVariable Long operatorId) {
        return ResponseEntity.ok(partStatusTrackingService.getOperatorMetrics(operatorId));
    }

    @GetMapping("/{trackingId}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<PartStatusTracking> getTrackingById(
            @PathVariable Long trackingId) {
        return ResponseEntity.ok(partStatusTrackingService.getTrackingById(trackingId));
    }

    @PostMapping("/mark-ready")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<Void> markAsReadyForDelivery(@RequestBody String qrData) {
    partStatusTrackingService.markAsReadyForDelivery(qrData);
    return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{trackingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTracking(
            @PathVariable Long trackingId) {
        partStatusTrackingService.deleteTracking(trackingId);
        return ResponseEntity.noContent().build();
    }

  

    // @GetMapping("/observed")
    // public ResponseEntity<List<PartStatusTracking>> getObservedParts() {
    //     List<PartStatusTracking> observedParts = partStatusTrackingService.getObservedParts();
    //     return ResponseEntity.ok(observedParts);
    // }

    @GetMapping("/observed")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<List<PartStatusTracking>> getObservedParts() {
        List<PartState> observedStates = Arrays.asList(
                PartState.FALTANTE, PartState.DEVOLUCION_FUERA_DE_MEDIDA,
                PartState.REPINTANDO_POR_GOLPE_O_RAYON, PartState.REPARACION);
        List<PartStatusTracking> observedTrackings = observedStates.stream()
                .flatMap(state -> partStatusTrackingService.getTrackingsByPartState(state).stream())
                .collect(Collectors.toList());
        return ResponseEntity.ok(observedTrackings);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<PartStatusTracking> savePartStatusTracking(@RequestBody PartStatusTracking partStatusTracking) {
        PartStatusTracking savedTracking = partStatusTrackingService.savePartStatusTracking(partStatusTracking);
        return ResponseEntity.ok(savedTracking);
    }

    @GetMapping("/by-state/{state}")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<List<PartSummaryDTO>> getPartsByState(@PathVariable PartState state) {
        List<PartSummaryDTO> parts = partStatusTrackingService.getPartsByState(state);
        return ResponseEntity.ok(parts);
    }

    @GetMapping("/by-all-states")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
    public ResponseEntity<List<StatePartsDTO>> getAllPartsByState() {
        List<StatePartsDTO> stateParts = partStatusTrackingService.getAllPartsByState();
        return ResponseEntity.ok(stateParts);
    }

   
}
