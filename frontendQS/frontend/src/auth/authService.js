import axios from "axios";
import * as jwt_decode from "jwt-decode";

const API_URL = "http://localhost:8080/api/auth";

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });

  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem("token", response.data.jwt); // Guarda el token solo si localStorage está disponible
  }

  return response.data;
};

export const logout = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.removeItem("token"); // Borra el token solo si localStorage está disponible
  }
};

export const getRoleFromToken = () => {
  if (typeof window === "undefined" || !window.localStorage) return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decodedToken = jwt_decode(token);
    return decodedToken.role; // Asegúrate que el token incluye el campo `role`
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return (
    typeof window !== "undefined" &&
    window.localStorage &&
    !!localStorage.getItem("token")
  );
};
