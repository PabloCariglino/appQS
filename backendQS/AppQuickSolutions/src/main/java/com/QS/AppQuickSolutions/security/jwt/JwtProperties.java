package com.QS.AppQuickSolutions.security.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class JwtProperties {

    // Tiempo de expiración del token JWT en milisegundos
    private long jwtExpirationMs;

    // Getters y Setters
    public long getJwtExpirationMs() {
        return jwtExpirationMs;
    }

    public void setJwtExpirationMs(long jwtExpirationMs) {
        this.jwtExpirationMs = jwtExpirationMs;
    }
}
