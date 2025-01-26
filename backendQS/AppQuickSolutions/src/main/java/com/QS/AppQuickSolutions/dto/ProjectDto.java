package com.QS.AppQuickSolutions.dto;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import jakarta.validation.constraints.NotNull;
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
    
    @NotNull
    private String clientAlias;
    @NotNull
    private Long contact;
    @NotNull
    private LocalDateTime visitDateTime;
    private Boolean visitStatus; //estado de visita en domicilio para medidas, fue visitado el cliente?
    private Boolean developmentStatus; // Estado de desarrollo de pieza en fabrica
    private Boolean inFolder; // Estado de envio de documentacion al plegador, se envio al plegador el detalle de piezas?
    @NotNull
    private LocalDateTime installationDateTime;
    private Date createdDate;
    private Boolean state;
    private List<PartDto> parts;
}


