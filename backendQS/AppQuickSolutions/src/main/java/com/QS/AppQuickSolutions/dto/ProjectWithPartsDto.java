package com.QS.AppQuickSolutions.dto;

import java.util.List;

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
public class ProjectWithPartsDto {
    
    private ProjectDto project;
    private List<PartDto> parts;
}
