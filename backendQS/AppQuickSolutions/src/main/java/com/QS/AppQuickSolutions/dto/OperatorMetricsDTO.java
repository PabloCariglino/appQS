package com.QS.AppQuickSolutions.dto;

import java.util.List;
import java.util.Map;

import com.QS.AppQuickSolutions.entity.PartStatusTracking;
import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.enums.PartState;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class OperatorMetricsDTO {
    private User user;
    private List<PartStatusTracking> completedParts;
    private Map<PartState, Double> avgDurationByCategory;
    private Map<PartState, List<PartStatusTracking>> trackingsByInitialState;
    private Map<String, Long> partCountByPeriod; // e.g., {"DAY": 5, "MONTH": 20, "YEAR": 100}
    private long totalTasks; // Total de tareas completadas
    private double averageTaskDuration; // Duración promedio general de las tareas
}
