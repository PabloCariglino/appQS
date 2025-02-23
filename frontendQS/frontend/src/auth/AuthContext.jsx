// AuthContext.jsx
import PropTypes from "prop-types";
import React, { createContext, useEffect, useState } from "react";
import { getRoleFromToken, isAuthenticated } from "./AuthService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      setRole(getRoleFromToken());
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, setRole, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
