package com.QS.AppQuickSolutions.security.jwt;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.QS.AppQuickSolutions.security.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        System.out.println("--- JwtRequestFilter invoked ---");

        // Obtener el token JWT desde el encabezado de la solicitud
        String jwt = jwtTokenProvider.getJwtFromRequest(request);
        System.out.println("Extracted JWT: " + jwt);

        if (jwt != null) {
            try {
                // Validar el token JWT
                if (jwtTokenProvider.validateToken(jwt)) {
                    System.out.println("JWT is valid");

                    // Obtener el nombre de usuario desde el JWT
                    String username = jwtTokenProvider.getUsernameFromJWT(jwt);
                    System.out.println("Username from JWT: " + username);

                    // Cargar detalles del usuario
                    UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                    System.out.println("UserDetails loaded: " + userDetails.getUsername());

                    // Crear el objeto de autenticación y configurarlo en el contexto de seguridad
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    // Log para confirmar Authorities
                    System.out.println("Authorities in SecurityContext: "
                            + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                } else {
                    System.out.println("JWT validation failed");
                }
            } catch (Exception e) {
                System.out.println("Error processing JWT: " + e.getMessage());
            }
        } else {
            System.out.println("JWT is missing from request");
        }

        // Continuar con la cadena de filtros
        chain.doFilter(request, response);
    }
}
