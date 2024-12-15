package com.QS.AppQuickSolutions.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.LoginRequest;
import com.QS.AppQuickSolutions.dto.LoginResponse;
import com.QS.AppQuickSolutions.security.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        System.out.println("Login attempt with email: " + loginRequest.getEmail());
        try {
            String jwt = authService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
            System.out.println("Login successful for email: " + loginRequest.getEmail());
            return ResponseEntity.ok(new LoginResponse(jwt));
        } catch (Exception e) {
            System.out.println("Login failed for email: " + loginRequest.getEmail() + " - Error: " + e.getMessage());
            return ResponseEntity.status(401).body(new LoginResponse(null));
        }
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        if (authentication != null) {
            System.out.println("Logout attempt by user: " + authentication.getName());
            new SecurityContextLogoutHandler().logout(request, response, authentication);
            System.out.println("Logout successful for user: " + authentication.getName());
        } else {
            System.out.println("Logout attempt with no active authentication");
        }
    }
}
