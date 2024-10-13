package com.QS.AppQuickSolutions.dto;

import com.QS.AppQuickSolutions.enums.Role;

public class LoginResponse {
    private String token;
    private Role role;

    public LoginResponse(String token, Role role) {
        this.token = token;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public Role getRole() {
        return role;
    }
}