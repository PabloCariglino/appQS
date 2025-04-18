package com.QS.AppQuickSolutions.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.QS.AppQuickSolutions.enums.PartState;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PartSummaryDTO {
    private UUID partId;
    private Long projectId;
    private String partName;
    private PartState partState;
    private LocalDateTime scanDateTime;
}
