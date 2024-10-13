package com.QS.AppQuickSolutions.enums;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

public enum Role {
    
    ADMIN,
    OPERATOR;

    public SimpleGrantedAuthority toGrantedAuthority() {
        return new SimpleGrantedAuthority("ROLE_" + this.name());
    }
}
