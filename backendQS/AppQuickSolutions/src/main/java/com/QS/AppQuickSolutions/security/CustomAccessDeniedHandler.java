package com.QS.AppQuickSolutions.security;

import java.io.IOException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        System.out.println("AccessDeniedHandler invoked!");
        System.out.println("User principal: " + request.getUserPrincipal());
        System.out.println("Requested URI: " + request.getRequestURI());
        System.out.println("Error message: " + accessDeniedException.getMessage());

        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: " + accessDeniedException.getMessage());
    }
}
