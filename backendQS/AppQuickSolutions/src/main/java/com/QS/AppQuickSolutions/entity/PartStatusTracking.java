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
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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
@Table(indexes = {@Index(name = "idx_user_part_completed", columnList = "operator_id, part_id, is_completed")})
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

    @Enumerated(EnumType.STRING)
    @Column(name = "initial_part_state")
    private PartState initialPartState;

    private LocalDateTime startTime; //fecha y hora de inicio de proceso
    private LocalDateTime endTime;  //fecha y hora de fin de proceso

    @Column
    private Long taskDuration; // Duración de la tarea en minutos

    private boolean isTaken; // campo para indicar si la pieza está tomada
    private boolean isCompleted = false; //estado para saber si en la píeza se completo o no su trabajo

  

    @Column
    private String description; // Para describir problemas (REPARACION, DEVOLUCION_FUERA_DE_MEDIDA, etc.)
}
