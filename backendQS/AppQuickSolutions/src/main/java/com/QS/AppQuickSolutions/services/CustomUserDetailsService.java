package com.QS.AppQuickSolutions.services;

import java.util.Collections;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.entity.User;
import com.QS.AppQuickSolutions.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Convertir el rol del usuario en una lista de GrantedAuthority
        List<GrantedAuthority> authorities = Collections.singletonList(user.getRole().toGrantedAuthority());

        return new org.springframework.security.core.userdetails.User(user.getEmail(),
        user.getPassword(), authorities);
    }


}
