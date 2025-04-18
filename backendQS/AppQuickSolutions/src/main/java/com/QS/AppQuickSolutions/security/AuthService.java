package com.QS.AppQuickSolutions.security;

import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.security.jwt.JwtTokenProvider;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
   

    public AuthService(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider, CustomUserDetailsService userDetailsService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    public String authenticateUser(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));
        return jwtTokenProvider.generateAccessToken(authentication);
    }

    public String generateAccessTokenForUser(String username) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        return jwtTokenProvider.generateAccessTokenFromUserDetails(userDetails);
    }

    // Nuevo método para obtener roles
    public String getRolesForUser(String username) throws UsernameNotFoundException {
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        return userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .collect(Collectors.joining(","));
    }
}
