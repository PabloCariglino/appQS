package com.QS.AppQuickSolutions.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserUpdateDto {
    @NotBlank(message = "El nombre de usuario es obligatorio")
    private String userName;

    private String password; // Este campo puede ser opcional
}
