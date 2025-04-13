package com.QS.AppQuickSolutions.dto;

import java.util.List;
import java.util.Map;

import com.QS.AppQuickSolutions.entity.PartStatusTracking;
import com.QS.AppQuickSolutions.entity.User;
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
public class OperatorMetricsDTO {
    private User user;
    private List<PartStatusTracking> completedParts;
    private Map<PartState, Double> avgDurationByCategory;
}
