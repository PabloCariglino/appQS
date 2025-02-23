package com.QS.AppQuickSolutions.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.QS.AppQuickSolutions.entity.CustomPart;
import com.QS.AppQuickSolutions.entity.PartMaterial;
import com.QS.AppQuickSolutions.entity.Project;
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
public class PartDto {

    private UUID id;
    private CustomPart customPart;
    private PartMaterial partMaterial;
    private Double totalweightKg;
    private Double sheetThicknessMm;
    private Double lengthPiecesMm;
    private Double heightMm;
    private Double widthMm;
    private String qrCodeData; //Guarda el QR asociado
    private String qrCodeFilePath; //Guarda la URL o el path de la imagen del QR
    
    private Boolean receptionState;
    private LocalDateTime scanDateTime; //Fecha y hora de escaneao de recepcion de pieza
    private Boolean qualityControlState; //Control de calidad de pieza

    private PartState partState;

    private String observations; //Observaciones
    // private ProjectDto project;
    private Project project;
}
