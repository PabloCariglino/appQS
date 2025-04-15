package com.QS.AppQuickSolutions.services;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.dto.OperatorMetricsDTO;
import com.QS.AppQuickSolutions.dto.PartSummaryDTO;
import com.QS.AppQuickSolutions.dto.StatePartsDTO;
import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.PartStatusTracking;
import com.QS.AppQuickSolutions.entity.Project;
import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.enums.PartState;
import com.QS.AppQuickSolutions.repository.PartRepository;
import com.QS.AppQuickSolutions.repository.PartStatusTrackingRepository;
import com.QS.AppQuickSolutions.repository.UserRepository;
import com.google.zxing.WriterException;

import io.jsonwebtoken.io.IOException;

@Service
public class PartStatusTrackingService {

    private final PartStatusTrackingRepository partStatusTrackingRepository;
    private final PartRepository partRepository;
    private final UserRepository userRepository;
    private final QRCodeService qrCodeService;

    // Estados que se mostrarán como columnas
    private static final PartState[] DISPLAYED_STATES = {
        PartState.CONTROL_CALIDAD_EN_FABRICA,
        PartState.SOLDADO_FLAPEADO,
        PartState.FOFATIZADO_LIJADO,
        PartState.PINTADO,
        PartState.EMBALADO,
        PartState.INSTALACION_DOMICILIO,
        PartState.INSTALADO_EXITOSO
    };

    // Estados considerados como "observadas"
    private static final PartState[] OBSERVED_STATES = {
        PartState.FALTANTE,
        PartState.DEVOLUCION_FUERA_DE_MEDIDA,
        PartState.REPINTANDO_POR_GOLPE_O_RAYON,
        PartState.REPARACION
    };




    public PartStatusTrackingService(
        PartStatusTrackingRepository partStatusTrackingRepository,
        PartRepository partRepository,
        UserRepository userRepository,
        QRCodeService qrCodeService) {
        this.partStatusTrackingRepository = partStatusTrackingRepository;
        this.partRepository = partRepository;
        this.userRepository = userRepository;
        this.qrCodeService = qrCodeService;
    }

    // Método para calcular y formatear la duración en días, horas y minutos
    public String formatDuration(Long minutes) {
        if (minutes == null) return "0 días, 0 horas, 0 minutos";
        long days = minutes / (24 * 60);
        minutes %= (24 * 60);
        long hours = minutes / 60;
        minutes %= 60;
        return String.format("%d días, %d horas, %d minutos", days, hours, minutes);
    }

    // Crear un nuevo seguimiento (cuando un operario toma una pieza)
    public PartStatusTracking startTracking(UUID partId, Long operatorId) {
        Part part = partRepository.findById(partId).orElseThrow();
        User operator = userRepository.findById(operatorId).orElseThrow();
    
        // Verificar si el operario tiene una pieza en proceso
        List<PartStatusTracking> activeTrackings = partStatusTrackingRepository
                .findByUserOperatorAndIsCompletedFalse(operator);
        if (!activeTrackings.isEmpty()) {
            throw new RuntimeException("El operario ya tiene una pieza en proceso");
        }
    
       
        partStatusTrackingRepository.findByPartAndUserOperatorAndIsCompletedFalse(part, operator)
                .ifPresent(tracking -> {
                    throw new RuntimeException("El operario ya está trabajando en esta pieza");
                });
    
        PartStatusTracking tracking = new PartStatusTracking();
        tracking.setPart(part);
        tracking.setUserOperator(operator);
        tracking.setPartState(part.getPartState());
        tracking.setStartTime(LocalDateTime.now());
        tracking.setCompleted(false);
    
        return partStatusTrackingRepository.save(tracking);
    }

    // Completar un seguimiento (cuando un operario finaliza una tarea)
    public PartStatusTracking completeTracking(UUID partId, Long operatorId) throws java.io.IOException {
        Part part = partRepository.findById(partId).orElseThrow();
        User operator = userRepository.findById(operatorId).orElseThrow();
    
        PartStatusTracking tracking = partStatusTrackingRepository
                .findByPartAndUserOperatorAndIsCompletedFalse(part, operator)
                .orElseThrow();
    
        tracking.setEndTime(LocalDateTime.now());
        tracking.setCompleted(true);
    
        long taskDuration = ChronoUnit.MINUTES.between(tracking.getStartTime(), tracking.getEndTime());
        tracking.setTaskDuration(taskDuration);
    
        PartState nextState = getNextState(tracking.getPartState(), tracking.getEndTime(), tracking);
        tracking.setPartState(nextState);
        part.setPartState(nextState);
    
        // Generar QR si pasa a EMBALADO
        if (nextState == PartState.EMBALADO) {
            generateQrForEmbalado(tracking);
        }
    
        partStatusTrackingRepository.save(tracking);
        partRepository.save(part);
    
        return tracking;
    }

    // Obtener un seguimiento por ID
    public PartStatusTracking getTrackingById(Long trackingId) {
        return partStatusTrackingRepository.findById(trackingId)
                .orElseThrow(() -> new RuntimeException("Seguimiento no encontrado"));
    }

    // Listar todos los seguimientos
    public List<PartStatusTracking> getAllTrackings() {
        return partStatusTrackingRepository.findAll();
    }

    // Listar seguimientos por operario (historial completo de tareas completadas)
    public List<PartStatusTracking> getTrackingsByOperator(Long operatorId) {
        User operator = userRepository.findById(operatorId)
                .orElseThrow(() -> new RuntimeException("Operario no encontrado"));
        return partStatusTrackingRepository.findByUserOperatorAndIsCompletedTrue(operator);
    }

    // Listar seguimientos por pieza
    public List<PartStatusTracking> getTrackingsByPart(UUID partId) {
        Part part = partRepository.findById(partId)
                .orElseThrow(() -> new RuntimeException("Pieza no encontrada"));
        return partStatusTrackingRepository.findByPart(part);
    }

    // Listar seguimientos por proyecto (usando el projectId desde Part)
    public List<PartStatusTracking> getTrackingsByProject(Long projectId) {
        return partStatusTrackingRepository.findAll().stream()
                .filter(tracking -> tracking.getPart().getProject().getId().equals(projectId))
                .collect(Collectors.toList());
    }

    // Listar piezas por categoría (PartState)
    public List<PartStatusTracking> getTrackingsByPartState(PartState partState) {
        return partStatusTrackingRepository.findByPartStateAndIsCompletedFalse(partState);
    }

    // Eliminar un seguimiento
    public void deleteTracking(Long trackingId) {
        PartStatusTracking tracking = getTrackingById(trackingId);
        partStatusTrackingRepository.delete(tracking);
    }

    public String generateQrForEmbalado(PartStatusTracking tracking) throws java.io.IOException {
    Part part = tracking.getPart();
    Project project = part.getProject();
    String qrData = String.format("ProjectID: %d, PartID: %s, PartName: %s, Client: %s",
            project.getId(), part.getId().toString(), part.getCustomPart().getCustomPartName(), project.getClientAlias());
    String fileName = part.getId() + "_embalado_qr.png";
    try {
        return qrCodeService.generateCustomQRCode(qrData, fileName);
    } catch (WriterException | IOException e) {
        throw new RuntimeException("Error generando QR para EMBALADO", e);
    }  
    }

    public void markAsReadyForDelivery(String qrData) {
        Part part = qrCodeService.scanDeliveryQRCode(qrData);
    }

    private void checkProjectCompletion(Long projectId) {
    List<PartStatusTracking> projectTrackings = getTrackingsByProject(projectId);
    boolean allReady = projectTrackings.stream()
            .filter(t -> t.getPartState() == PartState.INSTALACION_DOMICILIO)
            .map(PartStatusTracking::getPart)
            .allMatch(Part::isReadyForDelivery);
    if (allReady) {
        projectTrackings.forEach(t -> {
            t.setPartState(PartState.INSTALADO_EXITOSO);
            partStatusTrackingRepository.save(t);
        });
    }
    }

    // Método auxiliar para avanzar entre estados (respetando reglas de PartState)
    private PartState getNextState(PartState currentState, LocalDateTime endTime, PartStatusTracking tracking) {
        switch (currentState) {
            case CONTROL_CALIDAD_EN_FABRICA:
                return PartState.SOLDADO_FLAPEADO; // Por defecto, pero se puede cambiar manualmente
            case SOLDADO_FLAPEADO:
                return PartState.FOFATIZADO_LIJADO;
            case FOFATIZADO_LIJADO:
                return PartState.PINTADO;
            case PINTADO:
                long hoursSinceEnd = ChronoUnit.HOURS.between(tracking.getEndTime(), LocalDateTime.now());
                if (hoursSinceEnd >= 12) {
                    return PartState.EMBALADO;
                }
                return PartState.EMBALADO; // Pasa a EMBALADO pero no seleccionable hasta 12 horas
            case EMBALADO:
                return PartState.INSTALACION_DOMICILIO;
            case INSTALACION_DOMICILIO:
                return PartState.INSTALADO_EXITOSO;
            default:
                return currentState;
        }
    }
    
    // método para transiciones manuales con descripción
    public PartStatusTracking manualTransition(UUID partId, Long operatorId, PartState newState, String description) {
        Part part = partRepository.findById(partId).orElseThrow();
        User operator = userRepository.findById(operatorId).orElseThrow();
    
        PartStatusTracking tracking = partStatusTrackingRepository
                .findByPartAndUserOperatorAndIsCompletedFalse(part, operator)
                .orElseThrow();
    
        tracking.setEndTime(LocalDateTime.now());
        tracking.setCompleted(true);
        long taskDuration = ChronoUnit.MINUTES.between(tracking.getStartTime(), tracking.getEndTime());
        tracking.setTaskDuration(taskDuration);
        tracking.setPartState(newState);
        tracking.setDescription(description);
        part.setPartState(newState);
    
        partStatusTrackingRepository.save(tracking);
        partRepository.save(part);
    
        return tracking;
    }

    public OperatorMetricsDTO getOperatorMetrics(Long operatorId) {
        User operator = userRepository.findById(operatorId).orElseThrow();
        List<PartStatusTracking> trackings = partStatusTrackingRepository.findByUserOperatorAndIsCompletedTrue(operator);
    
        // Piezas del último año
        List<PartStatusTracking> lastYearTrackings = trackings.stream()
                .filter(t -> t.getEndTime().isAfter(LocalDateTime.now().minusYears(1)))
                .collect(Collectors.toList());
    
        // Promedio por categoría
        Map<PartState, Double> avgDurationByCategory = lastYearTrackings.stream()
                .collect(Collectors.groupingBy(
                        PartStatusTracking::getPartState,
                        Collectors.averagingLong(PartStatusTracking::getTaskDuration)
                ));
    
        return new OperatorMetricsDTO(operator, lastYearTrackings, avgDurationByCategory);
    }

    public List<PartSummaryDTO> getPartsByState(PartState state) {
        return partRepository.findAllByPartState(state).stream()
                .sorted(Comparator.comparing(part -> part.getProject() != null ? part.getProject().getInstallationDateTime() : null, 
                    Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PartSummaryDTO> getObservedParts() {
        return partRepository.findAll().stream()
                .filter(part -> Arrays.asList(OBSERVED_STATES).contains(part.getPartState()))
                .sorted(Comparator.comparing(part -> part.getProject() != null ? part.getProject().getInstallationDateTime() : null, 
                    Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StatePartsDTO> getAllPartsByState() {
        List<StatePartsDTO> stateParts = Arrays.stream(DISPLAYED_STATES)
                .map(state -> {
                    StatePartsDTO dto = new StatePartsDTO();
                    dto.setState(state);
                    dto.setParts(getPartsByState(state));
                    return dto;
                })
                .collect(Collectors.toList());

        // Añadir las piezas observadas como una "columna" adicional
        StatePartsDTO observedDto = new StatePartsDTO();
        observedDto.setState(null); // No es un PartState real
        observedDto.setParts(getObservedParts());
        stateParts.add(observedDto);

        return stateParts;
    }

    public PartStatusTracking savePartStatusTracking(PartStatusTracking partStatusTracking) {
        return partStatusTrackingRepository.save(partStatusTracking);
    }

    private PartSummaryDTO convertToDTO(Part part) {
        PartSummaryDTO dto = new PartSummaryDTO();
        dto.setPartId(part.getId());
        dto.setProjectId(part.getProject() != null ? part.getProject().getId() : null);
        dto.setPartName(part.getCustomPart() != null ? part.getCustomPart().getCustomPartName() : "Sin nombre");
        dto.setPartState(part.getPartState());
        dto.setScanDateTime(part.getScanDateTime());
        return dto;
    }
}