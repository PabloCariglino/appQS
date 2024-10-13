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

    private String projectName;
    private String clientAlias;
    private Long contact;
    private Boolean state;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate = new Date(); // Guarda la fecha actual al crear el proyecto

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List <Part> parts;

 
}
