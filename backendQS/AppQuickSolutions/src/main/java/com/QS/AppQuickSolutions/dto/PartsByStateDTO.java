package com.QS.AppQuickSolutions.dto;

import java.util.List;

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
public class PartsByStateDTO {
    private PartState state;
    private List<PartTrackingSummaryDTO> parts;
}
