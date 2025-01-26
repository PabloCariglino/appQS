package com.QS.AppQuickSolutions.entity;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 50, message = "El alias del cliente debe tener entre 3 y 50 caracteres.")
    private String clientAlias;

    @NotNull(message = "El contacto no puede ser nulo.")
    private Long contact;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date(); // Guarda la fecha actual al crear el proyecto

    
    private LocalDateTime visitDateTime;
    private Boolean visitStatus; //estado de visita en domicilio para medidas, fue visitado el cliente?
    private Boolean developmentStatus; // Estado de desarrollo de pieza en fabrica
    private Boolean inFolder; // Estado de envio de documentacion al plegador, se envio al plegador el detalle de piezas?
    
    private LocalDateTime installationDateTime;

    private Boolean state;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference  // Evitar recursión infinita
    private List<Part> parts;
}
