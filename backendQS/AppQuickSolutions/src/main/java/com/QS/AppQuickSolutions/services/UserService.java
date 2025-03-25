package com.QS.AppQuickSolutions.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.dto.UserDto;
import com.QS.AppQuickSolutions.dto.UserUpdateDto;
import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // @Autowired
    // private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(UserDto userDto) {

        System.out.println("Datos recibidos en registerUser: " + userDto); // Log de los datos recibidos

        // Validar si el correo ya está en uso
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalArgumentException("El correo electrónico ya está registrado.");
        }

        // Crear un nuevo usuario
        User newUser = new User();
        newUser.setUserName(userDto.getUserName());
        newUser.setEmail(userDto.getEmail());
        newUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        newUser.setUserStatus(userDto.getUserStatus() != null ? userDto.getUserStatus() : true);  // Por defecto activo
        newUser.setRole(userDto.getRole());
        // newUser.setRole(Role.ADMIN);


        // Guardar el usuario en la base de datos
        User savedUser = userRepository.save(newUser);

        // Enviar correo de bienvenida
        // String subject = "¡Bienvenido a nuestra plataforma!";
        // String body = "Hola " + userDto.getUserName() + ", gracias por registrarte en nuestra plataforma.";
        // emailService.sendWelcomeEmail(savedUser.getEmail(), subject, body);

        return savedUser;
    }

    public User updateUser(Long id, UserUpdateDto userUpdateDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        existingUser.setUserName(userUpdateDto.getUserName());

        if (userUpdateDto.getPassword() != null && !userUpdateDto.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userUpdateDto.getPassword())); // Usar el bean de passwordEncoder
        }

        return userRepository.save(existingUser);
    }

    // Cambiar el estado del usuario (alta/baja)
    public void changeUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Cambiar el estado del usuario
        user.setUserStatus(!user.getUserStatus()); // Cambia de true a false o viceversa
        userRepository.save(user); // Guarda el usuario con el nuevo estado
    }

    // Listar todos los usuarios
    public List<User> listAllUsers() {
        return userRepository.findAll(); // Devuelve todos los usuarios de la base de datos
    }

    // Buscar usuario por ID
    public User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // Buscar usuario por Email
    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        userRepository.delete(user);
    }
}
