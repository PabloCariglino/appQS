package com.QS.AppQuickSolutions.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.QS.AppQuickSolutions.enums.PartState;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
@Table(indexes = {@Index(name = "idx_part_state", columnList = "part_state")})
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)  // Usa GenerationType.AUTO para UUID
    @Column(updatable = false, nullable = false)
    private UUID id;

    // Relación ManyToOne con Project
    @ManyToOne
    @JsonBackReference  // Evitar recursión infinita
    private Project project;
    
    @ManyToOne
    private CustomPart customPart; //nombre de pieza creada con su imagen

    @ManyToOne
    private PartMaterial partMaterial;

    private Double totalweightKg; //Peso de chapa
    private Double SheetThicknessMm; //Espesor de chapa
    private Double lengthPiecesMm; //Largo de pieza
    private Double heightMm; //Alto de pieza
    private Double widthMm; //Ancho de pierza
    private String qrCodeData; //Guarda el QR asociado
    private String qrCodeFilePath; //Guarda la URL o el path de la imagen del QR
    
    private Boolean receptionState; //Estado de recepcion de pieza
    private LocalDateTime scanDateTime; //Fecha y hora de escaneao de recepcion de pieza
    private Boolean qualityControlState; //Control de calidad de pieza

    @Enumerated(EnumType.STRING)
    private PartState partState; //estados de pieza, categorias

    private String observations; //Observaciones

    @Column
    private boolean isReadyForDelivery;
}
