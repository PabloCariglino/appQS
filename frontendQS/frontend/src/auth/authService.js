// AuthService.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
// import * as jwtDecode from "jwt-decode";
// const jwtDecode = require("jwt-decode");
// import jwt_decode from "jwt-decode";
// import { default as jwt_decode } from "jwt-decode";
// import { decode as jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:8080/api/auth";

export const login = async (email, password) => {
  try {
    console.log("Intentando iniciar sesión con email:", email);
    const response = await axios.post(`${API_URL}/login`, { email, password });
    console.log("Respuesta del servidor al iniciar sesión:", response.data);
    return response;
  } catch (error) {
    console.error(
      "Error al realizar la solicitud de inicio de sesión:",
      error.response || error
    );
    throw error;
  }
};

export const backendLogout = async () => {
  try {
    const token = sessionStorage.getItem("token");
    console.log("Intentando cerrar sesión con token:", token);

    await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Cierre de sesión exitoso. Eliminando token.");
    sessionStorage.removeItem("token");
  } catch (error) {
    console.error(
      "Error al cerrar sesión del backend:",
      error.response || error
    );
  }
};

export const getRoleFromToken = () => {
  const token = sessionStorage.getItem("token");
  console.log("Obteniendo rol desde el token:", token);

  if (!token) {
    console.error("No se encontró un token en sessionStorage.");
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);
    console.log("Token decodificado:", decodedToken);
    return decodedToken.roles || null; // Ajusta según la estructura de tu token
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = sessionStorage.getItem("token");
  console.log("Verificando autenticación. Token presente:", !!token);
  return !!token;
};

export const setAuthToken = (token) => {
  console.log("Estableciendo token en sessionStorage:", token);

  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      sessionStorage.setItem("token", token);
    } catch (error) {
      console.error("Error al almacenar el token en sessionStorage:", error);
    }
  }
};
