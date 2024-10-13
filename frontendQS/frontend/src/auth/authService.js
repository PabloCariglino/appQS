// authService.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
const API_URL = "http://localhost:8080/api/auth";

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  localStorage.setItem("token", response.data.token);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getRoleFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null; // No hay token
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.role; // Suponiendo que el token tiene el campo `role`
  } catch {
    return null; // Token inválido o expirado
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
