import React, { createContext, useEffect, useState } from "react";
import { getRoleFromToken } from "./authService";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userRole = getRoleFromToken();
    setRole(userRole);
  }, []);

  return (
    <AuthContext.Provider value={{ role }}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
