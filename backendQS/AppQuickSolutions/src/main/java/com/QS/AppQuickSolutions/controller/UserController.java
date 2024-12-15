package com.QS.AppQuickSolutions.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.UserDto;
import com.QS.AppQuickSolutions.dto.UserUpdateDto;
import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.security.SecurityUtils;
import com.QS.AppQuickSolutions.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user-dashboard")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register-user")
    @PreAuthorize("hasRole('ADMIN')") // Verifica que el usuario tenga el rol ADMIN
    public ResponseEntity<?> createUser(@Valid @RequestBody UserDto userDto) {
        try {
            User savedUser = userService.registerUser(userDto);
            return ResponseEntity.ok(savedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/update-user/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')") // Tanto ADMIN como OPERATOR pueden actualizar usuarios
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateDto userUpdateDto) {
        try {
            User updatedUser = userService.updateUser(id, userUpdateDto);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Cambiar estado de usuario (alta/baja)
    @PatchMapping("/change-user-status/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede cambiar el estado
    public ResponseEntity<String> changeUserStatus(@PathVariable Long id) {
        try {
            userService.changeUserStatus(id);
            return ResponseEntity.ok("Estado del usuario cambiado correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }
    }

    // Listar todos los usuarios
    @GetMapping("/user-list")
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede listar usuarios
    public ResponseEntity<List<User>> listUsers() {
        List<User> users = userService.listAllUsers();
        return ResponseEntity.ok(users);
    }

    // Buscar usuario por ID
    @GetMapping("/find-user/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')") // Ambos roles pueden buscar
    public ResponseEntity<User> findUserById(@PathVariable Long id) {
        try {
            User user = userService.findUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Buscar usuario por email
    @GetMapping("/find-user-by-email/{email}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')") // Ambos roles pueden buscar
    public ResponseEntity<User> findUserByEmail(@PathVariable String email) {
        try {
            User user = userService.findUserByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
            return ResponseEntity.ok(user);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // devuelve el rol al logear basado en el token JWT
    @GetMapping("/users/role")
    public ResponseEntity<String> getUserRole() {
        String email = SecurityUtils.getCurrentAuthenticatedEmail();
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No se pudo obtener el email del usuario");
        }

        User user = userService.findUserByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return ResponseEntity.ok(user.getRole().name()); // Retorna el rol como String
    }
}
