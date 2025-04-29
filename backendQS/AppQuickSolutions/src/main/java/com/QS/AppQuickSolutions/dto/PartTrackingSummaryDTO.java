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
public class PartTrackingSummaryDTO {
    private UUID partId;
    private Long projectId;
    private String partName;
    private PartState partState;
    private LocalDateTime scanDateTime;

    private Long trackingId;
    private LocalDateTime startTime;
    private LocalDateTime endTime; 
    private boolean completed;
    private boolean isTaken;
}
