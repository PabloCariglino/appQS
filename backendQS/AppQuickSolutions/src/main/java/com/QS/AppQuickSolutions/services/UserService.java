package com.QS.AppQuickSolutions.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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

    @Autowired
    private EmailService emailService;

     @Autowired
    private PasswordEncoder passwordEncoder;

    // @Autowired
    // private BCryptPasswordEncoder passwordEncoder;

    public User registerUser(UserDto userDto) {
        // Crear un nuevo usuario
        User newUser = new User();
        newUser.setUserName(userDto.getUserName());
        newUser.setEmail(userDto.getEmail());
        newUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        newUser.setUserStatus(userDto.getUserStatus() != null ? userDto.getUserStatus() : true);  // Por defecto activo
        newUser.setRole(userDto.getRole()); 
   
        // Guardar el usuario en la base de datos
        User savedUser = userRepository.save(newUser);

        // Enviar correo de bienvenida
        String subject = "¡Bienvenido a nuestra plataforma!";
        String body = "Hola " + userDto.getUserName() + ", gracias por registrarte en nuestra plataforma.";
        emailService.sendWelcomeEmail(savedUser.getEmail(), subject, body);

        return savedUser;
    }

    public User updateUser(Long id, UserUpdateDto userUpdateDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Actualizar solo los campos permitidos
        existingUser.setUserName(userUpdateDto.getUserName());
        
        if (userUpdateDto.getPassword() != null && !userUpdateDto.getPassword().isEmpty()) {
            existingUser.setPassword(new BCryptPasswordEncoder().encode(userUpdateDto.getPassword())); // Encriptar la nueva contraseña
        }

        return userRepository.save(existingUser); // Guarda el usuario actualizado en la base de datos
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
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // Buscar usuario por Email
    // public Optional<User> findUserByEmail(String email) {
    // return userRepository.findByEmail(email);
    // }

}