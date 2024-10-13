package com.QS.AppQuickSolutions.dto;

import java.time.LocalDateTime;

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
    private String partName;
    private String material;
    private Double totalweightKg;
    private Double sheetThicknessMm;
    private Double lengthPiecesMm;
    private Double heightMm;
    private Double widthMm;
    private LocalDateTime scanDateTime;
    private Boolean receptionState;
    private Boolean qualityControlState;
    private String observations;
}
