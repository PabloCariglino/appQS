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
public class ProjectDto {
    private String projectName;
    private String clientAlias;
    private Long contact;
    private Boolean state;
    private List<PartDto> parts;
}


