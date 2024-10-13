package com.QS.AppQuickSolutions.security.jwt;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.QS.AppQuickSolutions.security.SecurityUtils;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtTokenProvider {

    @Value("${app.jwtSecret}") // Asegúrate de definir esta propiedad en application.properties
    private String jwtSecret;

    @Value("${app.jwtExpirationMs}") // Asegúrate de definir esta propiedad en application.properties
    private int jwtExpirationMs;

    public String generateToken(Authentication authentication) {
        byte[] keyBytes = jwtSecret.getBytes(); // Convierte la clave secreta a bytes
        SecretKey secretKey = Keys.hmacShaKeyFor(keyBytes); // Genera la clave secreta

        // Obtener el email del usuario autenticado usando SecurityUtils
        String email = SecurityUtils.getCurrentAuthenticatedEmail();
        // Verificación para asegurarse de que el email no sea nulo
        if (email == null) {
        throw new IllegalStateException("No se pudo obtener el email del usuario autenticado.");
        }

        return Jwts.builder()
            .setSubject(email) // Usar el email como subject
            .setIssuedAt(new Date())
            .setExpiration(new Date(new Date().getTime() + jwtExpirationMs))
            .signWith(secretKey, SignatureAlgorithm.HS512) // Firma con la clave
            .compact();
    }

    public String getUsernameFromToken(String token) {
        byte[] keyBytes = jwtSecret.getBytes();
        SecretKey secretKey = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.parserBuilder()
                .setSigningKey(secretKey) // Usa la clave secreta generada
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            byte[] keyBytes = jwtSecret.getBytes();
            SecretKey secretKey = Keys.hmacShaKeyFor(keyBytes);

            Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);

            return true;
        } catch (JwtException e) { // Atrapamos cualquier excepción JWT
            return false;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
