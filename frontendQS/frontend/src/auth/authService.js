// authService.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:8080/api/auth";

let accessToken = null;

const isStorageAvailable = () => {
  try {
    const testKey = "__test__";
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn("Session storage no está disponible:", e);
    return false;
  }
};

export const setAccessToken = (token) => {
  if (isStorageAvailable()) {
    sessionStorage.setItem("token", token);
  }
  accessToken = token;
};

export const getAccessToken = () => {
  if (!accessToken && isStorageAvailable()) {
    try {
      accessToken = sessionStorage.getItem("token");
    } catch (error) {
      console.warn("Error al acceder a sessionStorage:", error);
    }
  }
  console.log("AccessToken recuperado:", accessToken); // Log adicional para depuración
  return accessToken;
};

export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token;
};

export const getRoleFromToken = () => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    const rawRole = decodedToken.roles || null;
    // Transformar el rol eliminando el prefijo "ROLE_" si existe
    return rawRole ? rawRole.replace("ROLE_", "") : null;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { accessToken: newAccessToken } = response.data;
    if (newAccessToken) {
      setAccessToken(newAccessToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    throw error;
  }
};

export const backendLogout = async (setIsLoggedIn, setRole) => {
  try {
    await axios.post(`${API_URL}/logout`);
    accessToken = null;
    sessionStorage.removeItem("token");
    setIsLoggedIn(false);
    setRole(null);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};
