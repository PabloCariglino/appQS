package com.QS.AppQuickSolutions.services;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.QS.AppQuickSolutions.dto.OperatorMetricsDTO;
import com.QS.AppQuickSolutions.dto.PartTrackingSummaryDTO;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.PartStatusTracking;
import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.enums.PartState;
import com.QS.AppQuickSolutions.repository.PartRepository;
import com.QS.AppQuickSolutions.repository.PartStatusTrackingRepository;
import com.QS.AppQuickSolutions.repository.UserRepository;

@Service
public class PartTrackingService {

    private static final Logger logger = LoggerFactory.getLogger(PartTrackingService.class);

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartStatusTrackingRepository partStatusTrackingRepository;

    // Método para obtener el siguiente estado de una pieza
    public PartState getNextState(PartState currentState) {
        return switch (currentState) {
            case DESARROLLO -> PartState.EN_PRODUCCION;
            case EN_PRODUCCION -> PartState.CONTROL_CALIDAD_EN_FABRICA;
            case CONTROL_CALIDAD_EN_FABRICA -> PartState.SOLDADO_FLAPEADO;
            case SOLDADO_FLAPEADO -> PartState.FOFATIZADO_LIJADO;
            case FOFATIZADO_LIJADO -> PartState.PINTADO;
            case PINTADO -> PartState.EMBALADO;
            case EMBALADO -> PartState.INSTALACION_DOMICILIO;
            case INSTALACION_DOMICILIO -> PartState.INSTALADO_EXITOSO;
            case REPINTANDO_POR_GOLPE_O_RAYON -> PartState.PINTADO;
            case REPARACION -> PartState.CONTROL_CALIDAD_EN_FABRICA;
            default -> null;
        };
    }

    // Método para tomar una pieza
    @Transactional
    public PartStatusTracking takePart(UUID partId, Long userId) {
        logger.info("Usuario {} intenta tomar la pieza {}", userId, partId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + userId));

        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Pieza no encontrada: " + partId));

        // Verificar si la pieza ya está tomada
        Optional<PartStatusTracking> existingTracking = partStatusTrackingRepository.findByPartAndIsCompletedFalse(part);
        if (existingTracking.isPresent()) {
            throw new RuntimeException("La pieza ya está tomada por otro usuario.");
        }

        // Verificar si el usuario ya tiene una pieza activa
        List<PartStatusTracking> activeTasks = partStatusTrackingRepository.findByUserOperatorUserIDAndIsCompletedFalse(userId);
        if (!activeTasks.isEmpty()) {
            throw new RuntimeException("El usuario ya tiene una pieza activa: " + activeTasks.get(0).getPart().getId());
        }

        // Crear un nuevo registro de seguimiento
        PartStatusTracking tracking = new PartStatusTracking();
        tracking.setPart(part);
        tracking.setUserOperator(user);
        tracking.setPartState(part.getPartState());
        tracking.setInitialPartState(part.getPartState());
        tracking.setStartTime(LocalDateTime.now());
        tracking.setCompleted(false);
        tracking.setTaken(true); // Marcar la pieza como tomada

        return partStatusTrackingRepository.save(tracking);
    }

    // Método para completar una pieza
    @Transactional
    public PartStatusTracking completePart(UUID partId, Long userId) {
        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Pieza no encontrada: " + partId));

        PartStatusTracking tracking = partStatusTrackingRepository
                .findByPartIdAndUserOperatorUserIDAndIsCompletedFalse(partId, userId)
                .orElseThrow(() -> new RuntimeException("No se encontró una tarea activa para esta pieza y usuario"));

        tracking.setEndTime(LocalDateTime.now());
        tracking.setCompleted(true);
        tracking.setTaken(false); // Marcar la pieza como no tomada al completar

        // Calcular la duración de la tarea
        long taskDuration = java.time.Duration.between(tracking.getStartTime(), tracking.getEndTime()).toMinutes();
        tracking.setTaskDuration(taskDuration);

        // Actualizar el estado de la pieza
        PartState nextState = getNextState(part.getPartState());
        if (nextState != null) {
            part.setPartState(nextState);
            tracking.setPartState(nextState);
            partRepository.save(part);
        }

        return partStatusTrackingRepository.save(tracking);
    }

    // Método para obtener el historial completo del usuario (tareas completadas y no completadas)
    public List<PartStatusTracking> getTrackingHistory(Long userId) {
        return partStatusTrackingRepository.findByUserOperatorUserID(userId);
    }

    // Método para obtener las tareas activas del usuario (no completadas)
    public List<PartStatusTracking> getActiveTasks(Long userId) {
        return partStatusTrackingRepository.findByUserOperatorUserIDAndIsCompletedFalse(userId);
    }

    // Método para obtener las métricas del usuario
    public OperatorMetricsDTO getUserMetrics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + userId));

        List<PartStatusTracking> completedTasks = partStatusTrackingRepository
                .findByUserOperatorUserIDAndIsCompletedTrue(userId);

        // Calcular métricas generales
        long totalTasks = completedTasks.size();
        double averageTaskDuration = completedTasks.stream()
                .mapToLong(PartStatusTracking::getTaskDuration)
                .average()
                .orElse(0.0);

        // Lista de piezas completadas
        List<PartStatusTracking> completedParts = completedTasks;

        // Duración promedio por categoría (partState)
        Map<PartState, Double> avgDurationByCategory = completedTasks.stream()
                .collect(Collectors.groupingBy(
                        PartStatusTracking::getPartState,
                        Collectors.averagingLong(PartStatusTracking::getTaskDuration)
                ));

        // Seguimientos agrupados por estado inicial
        Map<PartState, List<PartStatusTracking>> trackingsByInitialState = completedTasks.stream()
                .collect(Collectors.groupingBy(PartStatusTracking::getInitialPartState));

        // Conteo de piezas por período (día, mes, año)
        Map<String, Long> partCountByPeriod = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();

        long countDay = completedTasks.stream()
                .filter(task -> task.getEndTime() != null && ChronoUnit.DAYS.between(task.getEndTime(), now) <= 1)
                .count();
        long countMonth = completedTasks.stream()
                .filter(task -> task.getEndTime() != null && ChronoUnit.MONTHS.between(task.getEndTime(), now) <= 1)
                .count();
        long countYear = completedTasks.stream()
                .filter(task -> task.getEndTime() != null && ChronoUnit.YEARS.between(task.getEndTime(), now) <= 1)
                .count();

        partCountByPeriod.put("DAY", countDay);
        partCountByPeriod.put("MONTH", countMonth);
        partCountByPeriod.put("YEAR", countYear);

        // Crear el DTO con todas las métricas
        OperatorMetricsDTO metrics = new OperatorMetricsDTO();
        metrics.setUser(user);
        metrics.setCompletedParts(completedParts);
        metrics.setAvgDurationByCategory(avgDurationByCategory);
        metrics.setTrackingsByInitialState(trackingsByInitialState);
        metrics.setPartCountByPeriod(partCountByPeriod);
        metrics.setTotalTasks(totalTasks);
        metrics.setAverageTaskDuration(averageTaskDuration);

        return metrics;
    }

    // Método para obtener el historial del usuario (solo tareas completadas, usado por getUserHistory)
    public List<PartTrackingSummaryDTO> getUserHistory(Long userId) {
        List<PartStatusTracking> completedTasks = partStatusTrackingRepository
                .findByUserOperatorUserIDAndIsCompletedTrue(userId);

        return completedTasks.stream().map(tracking -> {
            PartTrackingSummaryDTO dto = new PartTrackingSummaryDTO();
            dto.setTrackingId(tracking.getId());
            dto.setPartId(tracking.getPart().getId());
            dto.setProjectId(tracking.getPart().getProject().getId());
            dto.setPartName(tracking.getPart().getCustomPart().getCustomPartName());
            dto.setPartState(tracking.getPartState());
            dto.setScanDateTime(tracking.getPart().getScanDateTime());
            dto.setStartTime(tracking.getStartTime());
            dto.setEndTime(tracking.getEndTime());
            dto.setCompleted(tracking.isCompleted());
            return dto;
        }).collect(Collectors.toList());
    }
}