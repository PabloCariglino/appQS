package com.QS.AppQuickSolutions.dto;

import com.QS.AppQuickSolutions.entity.CustomPart;
import com.QS.AppQuickSolutions.entity.PartMaterial;

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

    private CustomPart customPart;
    private PartMaterial partMaterial;
    private Double totalweightKg;
    private Double sheetThicknessMm;
    private Double lengthPiecesMm;
    private Double heightMm;
    private Double widthMm;
    private Boolean receptionState;
    private Boolean qualityControlState;
    private String observations;
}
