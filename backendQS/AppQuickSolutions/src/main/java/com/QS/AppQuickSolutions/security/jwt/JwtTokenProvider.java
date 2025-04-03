package com.QS.AppQuickSolutions.security.jwt;

import java.util.Date;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtTokenProvider {

    private final SecretKey jwtSecret;
    private final long jwtAccessExpiration;
    private final long jwtRefreshExpiration;

    // Almacenamiento temporal de Refresh Tokens
    private final ConcurrentHashMap<String, String> refreshTokenStore = new ConcurrentHashMap<>();

    public JwtTokenProvider(@Value("${app.jwtSecret}") String jwtSecret,
    @Value("${app.jwtAccessExpirationMs}") long accessExpiration,
    @Value("${app.jwtRefreshExpirationMs}") long refreshExpiration) {
    this.jwtSecret = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    this.jwtAccessExpiration = accessExpiration;
    this.jwtRefreshExpiration = refreshExpiration;
}

    // Generar Access Token a partir de Authentication
    public String generateAccessToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String roles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.joining(","));
    
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("roles", roles) // Verifica que los roles se incluyan
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtAccessExpiration))
                .signWith(jwtSecret)
                .compact();
    }

    // Generar Access Token desde UserDetails
    public String generateAccessTokenFromUserDetails(UserDetails userDetails) {
        String roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtAccessExpiration))
                .signWith(jwtSecret)
                .compact();
    }

    // Nuevo método para renovación explícita////////////
    public String generateAccessTokenFromUsername(String username, String roles) {
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtAccessExpiration))
                .signWith(jwtSecret)
                .compact();
    }

    // Generar Refresh Token
    public String generateRefreshToken(String username) {
        String refreshToken = UUID.randomUUID().toString();
        refreshTokenStore.put(refreshToken, username);
        return refreshToken;
    }

    // Validar Refresh Token
    public boolean validateRefreshToken(String refreshToken) {
        return refreshTokenStore.containsKey(refreshToken);
    }

    // Obtener Username desde Refresh Token
    public String getUsernameFromRefreshToken(String refreshToken) {
        return refreshTokenStore.get(refreshToken);
    }

    // Obtener el JWT desde el request
    public String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // Validar el token JWT
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(jwtSecret)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            System.out.println("Invalid JWT: " + e.getMessage());
            return false;
        }
    }

    // Obtener el nombre de usuario desde el token
    public String getUsernameFromJWT(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.getSubject();
    }

    // Obtener los claims desde el token
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getRolesFromJWT(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get("roles", String.class);
    }
    
}
