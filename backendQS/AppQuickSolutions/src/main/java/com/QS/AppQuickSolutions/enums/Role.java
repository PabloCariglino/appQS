package com.QS.AppQuickSolutions.enums;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

public enum Role {
    
    ADMIN,
    OPERATOR;

    // Método para convertir el rol a una autoridad de seguridad utilizada por Spring Security
    public SimpleGrantedAuthority toGrantedAuthority() {
        return new SimpleGrantedAuthority("ROLE_" + this.name());
    }
}
