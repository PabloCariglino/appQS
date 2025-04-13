package com.QS.AppQuickSolutions.entity;

import java.time.LocalDateTime;

import com.QS.AppQuickSolutions.enums.PartState;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PartStatusTracking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @ManyToOne
    @JoinColumn(name = "operator_id", nullable = false)
    private User userOperator;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartState partState;

    private LocalDateTime startTime; //fecha y hora de inicio de proceso
    private LocalDateTime endTime;  //fecha y hora de fin de proceso

    @Column
    private Long taskDuration; // Duración de la tarea en minutos

    private boolean isCompleted = false; //estado para saber si en la píeza se completo o no su trabajo
}
