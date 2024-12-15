import PropTypes from "prop-types";
import { createContext, useEffect, useState } from "react";
import { getRoleFromToken, isAuthenticated } from "./AuthService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("token");
      console.log("Token en AuthContext:", token);

      if (!token) {
        console.error("No se encontró un token en sessionStorage.");
      } else {
        const userRole = getRoleFromToken();
        console.log("Rol decodificado del token en AuthContext:", userRole);

        if (!userRole) {
          console.error("No se pudo decodificar el rol del token.");
        } else {
          setRole(userRole);
        }
        setIsLoggedIn(isAuthenticated());
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ role, setRole, isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
