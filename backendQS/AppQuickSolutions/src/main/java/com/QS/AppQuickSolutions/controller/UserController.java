package com.QS.AppQuickSolutions.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.UserDto;
import com.QS.AppQuickSolutions.dto.UserUpdateDto;
import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user-dashboard")
public class UserController {
    
 @Autowired
    private UserService userService;

    @PostMapping("/register-user")
    @PreAuthorize("hasRole('ADMIN')") // Verifica que el usuario tenga el rol ADMIN
    public ResponseEntity<User> createUser(@Valid @RequestBody UserDto userDto) {
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
        User updatedUser = userService.updateUser(id, userUpdateDto);
        return ResponseEntity.ok(updatedUser);
    }

    // Cambiar estado de usuario (alta/baja)
    @PatchMapping("/change-user-status/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Solo ADMIN puede cambiar el estado
    public ResponseEntity<String> changeUserStatus(@PathVariable Long id) {
        userService.changeUserStatus(id);
        return ResponseEntity.ok("Estado del usuario cambiado correctamente.");
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
        User user = userService.findUserById(id);
        return ResponseEntity.ok(user);
    }

    // Buscar usuario por email
    @GetMapping("/find-user-by-email/{email}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')") // Ambos roles pueden buscar
    public ResponseEntity<Optional<User>> findUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.findUserByEmail(email);
        return ResponseEntity.ok(user);
    }


    //devuelve el rol al logear
    @GetMapping("/users/role")
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')") // Ambos roles pueden buscar
    public ResponseEntity<String> getUserRole(@RequestParam String email) {
        User user = userService.findUserByEmail(email)
                     .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return ResponseEntity.ok(user.getRole().name()); // Retorna el rol como String
    }
    
}



