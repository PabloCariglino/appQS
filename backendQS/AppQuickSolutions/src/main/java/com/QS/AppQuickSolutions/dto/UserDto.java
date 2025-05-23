package com.QS.AppQuickSolutions.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;

import com.QS.AppQuickSolutions.enums.PartState;
import com.QS.AppQuickSolutions.enums.Role;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserDto {


    private Long userID;

    @NotEmpty(message = "El nombre de usuario no debe estar vacío")
    @Size(min = 3, max = 20, message = "El nombre de usuario debe tener entre 3 y 20 caracteres")
    private String userName;

    @Email(message = "Debe proporcionar un correo válido")
    @NotEmpty(message = "El correo no debe estar vacío")
    private String email;

    @NotEmpty(message = "La contraseña no debe estar vacía")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    private Boolean userStatus;

    @NotEmpty(message = "El rol no debe estar vacío")
    private Role role;

    @Enumerated(EnumType.STRING)
    private PartState preferredCategory;
}
