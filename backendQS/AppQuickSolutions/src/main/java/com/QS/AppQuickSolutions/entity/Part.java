package com.QS.AppQuickSolutions.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
public class Part{

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)  // Usa GenerationType.AUTO para UUID
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne
    private Project project;
    
    @ManyToOne
    private CustomPart customPart; //nombre de pieza creada con su imagen
    // @Enumerated(EnumType.STRING)
    // private PartName partName; 
    // Enum para nombres de piezas
    // private String image;

    @ManyToOne
    private PartMaterial partMaterial;
    // @Enumerated(EnumType.STRING)
    // private Material material; 
    // Enum para material
    
    private Double totalweightKg; //Peso de chapa
    private Double SheetThicknessMm; //Espesor de chapa
    private Double lengthPiecesMm; //Largo de pieza
    private Double heightMm; //Alto de pieza
    private Double widthMm; //Ancho de pierza

    private LocalDateTime scanDateTime; //Fecha y hora de escaneao de recepcion de pieza
    private Boolean receptionState; //Estado de recepcion de pieza
    private Boolean qualityControlState; //Control de calidad de pieza
    private String observations; //Observaciones

    private String qrCodeData; //Guarda el QR asociado
    private String qrCodeFilePath; //Guarda la URL o el path de la imagen del QR
    
}
