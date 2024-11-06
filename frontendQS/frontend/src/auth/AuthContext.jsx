// AuthContext.jsx
import PropTypes from "prop-types"; // Importamos PropTypes
import React, { createContext, useEffect, useState } from "react";
import { getRoleFromToken, isAuthenticated } from "./authService";

// Creamos el contexto
export const AuthContext = createContext();

// Definimos el proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Usamos useEffect para cargar la información del usuario al montar el componente
  useEffect(() => {
    const userRole = getRoleFromToken();
    setRole(userRole);
    setIsLoggedIn(isAuthenticated());
  }, []);

  return (
    <AuthContext.Provider value={{ role, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// Definimos las prop-types para validar las props
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired, // children es obligatorio
};
