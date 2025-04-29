// AuthService.js
import { jwtDecode } from "jwt-decode";
import api from "./AxiosServerConfig";

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
  accessToken = token;
  if (isStorageAvailable()) {
    try {
      sessionStorage.setItem("token", token);
    } catch (error) {
      console.warn("No se pudo guardar el token en sessionStorage:", error);
    }
  }
};

export const getAccessToken = () => {
  if (!accessToken && isStorageAvailable()) {
    try {
      accessToken = sessionStorage.getItem("token");
    } catch (error) {
      console.warn("Error al acceder a sessionStorage:", error);
      accessToken = null;
    }
  }
  // Verificar si el token está expirado
  if (accessToken) {
    try {
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        console.warn("Token expirado, limpiando...");
        accessToken = null;
        if (isStorageAvailable()) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("loginTime");
        }
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      accessToken = null;
    }
  }
  console.log("AccessToken recuperado:", accessToken);
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
    return rawRole ? rawRole.replace("ROLE_", "") : null;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
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
    await api.post("/auth/logout");
    accessToken = null;
    if (isStorageAvailable()) {
      sessionStorage.removeItem("token");
    }
    setIsLoggedIn(false);
    setRole(null);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/current-user");
    return response.data; // Devuelve el UserDto con userName
  } catch (error) {
    console.error("Error al obtener el usuario actual:", error);
    return null;
  }
};
