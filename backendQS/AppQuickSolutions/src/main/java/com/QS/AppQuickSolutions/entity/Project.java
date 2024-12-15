package com.QS.AppQuickSolutions.entity;

import java.util.Date;
import java.util.List;

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
    @Size(min = 3, max = 50, message = "El nombre del proyecto debe tener entre 3 y 50 caracteres.")
    private String projectName;

    @NotNull
    @Size(min = 3, max = 50, message = "El alias del cliente debe tener entre 3 y 50 caracteres.")
    private String clientAlias;

    @NotNull(message = "El contacto no puede ser nulo.")
    private Long contact;

    private Boolean state;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date(); // Guarda la fecha actual al crear el proyecto

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Part> parts;
}
