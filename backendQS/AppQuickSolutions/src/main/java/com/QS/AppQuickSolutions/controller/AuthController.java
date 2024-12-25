package com.QS.AppQuickSolutions.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.QS.AppQuickSolutions.dto.LoginRequest;
import com.QS.AppQuickSolutions.dto.LoginResponse;
import com.QS.AppQuickSolutions.dto.RefreshTokenRequest;
import com.QS.AppQuickSolutions.security.AuthService;
import com.QS.AppQuickSolutions.security.jwt.JwtTokenProvider;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthService authService, JwtTokenProvider jwtTokenProvider) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        System.out.println("Login attempt with email: " + loginRequest.getEmail());
        try {
            String accessToken = authService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
            String refreshToken = jwtTokenProvider.generateRefreshToken(loginRequest.getEmail());
            System.out.println("Login successful for email: " + loginRequest.getEmail());
            return ResponseEntity.ok(new LoginResponse(accessToken, refreshToken));
        } catch (Exception e) {
            System.out.println("Login failed for email: " + loginRequest.getEmail() + " - Error: " + e.getMessage());
            return ResponseEntity.status(401).body(new LoginResponse(null, null));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshAccessToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();
        System.out.println("Refresh token request received.");

        try {
            if (jwtTokenProvider.validateRefreshToken(refreshToken)) {
                String username = jwtTokenProvider.getUsernameFromRefreshToken(refreshToken);
                String newAccessToken = authService.generateAccessTokenForUser(username);
                System.out.println("Access token refreshed successfully for user: " + username);
                return ResponseEntity.ok(new LoginResponse(newAccessToken, refreshToken));
            } else {
                System.out.println("Invalid refresh token provided.");
                return ResponseEntity.status(403).body(new LoginResponse(null, null));
            }
        } catch (Exception e) {
            System.out.println("Error refreshing access token: " + e.getMessage());
            return ResponseEntity.status(500).body(new LoginResponse(null, null));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request) {
    String token = jwtTokenProvider.getJwtFromRequest(request);
    if (token != null && jwtTokenProvider.validateToken(token)) {
        System.out.println("Usuario deslogueado correctamente.");
        return ResponseEntity.ok("Logout exitoso.");
    } else {
        System.out.println("No se encontró un token válido para desloguear.");
        return ResponseEntity.status(400).body("Token inválido o inexistente.");
    }
}

}
