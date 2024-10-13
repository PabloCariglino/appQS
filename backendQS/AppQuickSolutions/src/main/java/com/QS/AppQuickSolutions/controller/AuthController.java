package com.QS.AppQuickSolutions.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.LoginDto;
import com.QS.AppQuickSolutions.dto.LoginResponse;
import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.services.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private com.QS.AppQuickSolutions.security.jwt.JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
    try {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );

        // Generar el token JWT
        String jwt = tokenProvider.generateToken(authentication);

        // Obtener el usuario autenticado
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userService.findUserByEmail(userDetails.getUsername());

        return ResponseEntity.ok(new LoginResponse(jwt, user.getRole()));
    } catch (BadCredentialsException e) {
        return ResponseEntity.badRequest().body("Invalid email or password"); // Mensaje específico
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
    }
}

}

