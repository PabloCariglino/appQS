//UserService.js
import axios from "axios";
import { getAccessToken } from "./AuthService";

const API_URL = "http://localhost:8080/api/user-dashboard";

const instance = axios.create({ baseURL: API_URL });

// Interceptor para incluir el token en todas las solicitudes
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Token enviado en la solicitud:", token); // Log para confirmar el token
    } else {
      console.warn("Token no disponible para la solicitud.");
    }
    return config;
  },
  (error) => {
    console.error("Error en el interceptor de la solicitud:", error);
    return Promise.reject(error);
  }
);

// Funciones del servicio de usuario
const UserService = {
  registerUser: async (userDto) => {
    try {
      console.log("Intentando registrar usuario con datos:", userDto); // Log de datos enviados
      const response = await instance.post("/register-user", userDto);
      console.log("Respuesta del backend (registro usuario):", response.data); // Log de respuesta
      return response.data;
    } catch (error) {
      console.error("Error al registrar usuario:", error.response || error); // Log de error detallado
      throw error; // Re-lanzar el error para manejo en el componente
    }
  },

  updateUser: async (id, userUpdateDto) => {
    try {
      console.log(`Intentando actualizar usuario con ID: ${id}`, userUpdateDto);
      const response = await instance.put(`/update-user/${id}`, userUpdateDto);
      console.log("Respuesta del backend (actualizar usuario):", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar usuario:", error.response || error);
      throw error;
    }
  },

  changeUserStatus: async (id) => {
    try {
      console.log(`Intentando cambiar estado del usuario con ID: ${id}`);
      const response = await instance.patch(`/change-user-status/${id}`);
      console.log("Respuesta del backend (cambiar estado):", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error al cambiar estado del usuario:",
        error.response || error
      );
      throw error;
    }
  },

  listUsers: async () => {
    try {
      console.log("Intentando listar usuarios...");
      const response = await instance.get("/user-list");
      console.log("Respuesta del backend (listar usuarios):", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al listar usuarios:", error.response || error);
      throw error;
    }
  },

  findUserById: async (id) => {
    try {
      console.log(`Intentando buscar usuario con ID: ${id}`);
      const response = await instance.get(`/find-user/${id}`);
      console.log(
        "Respuesta del backend (buscar usuario por ID):",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Error al buscar usuario por ID:", error.response || error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      console.log(`Intentando eliminar usuario con ID: ${id}`);
      const response = await instance.delete(`/delete-user/${id}`);
      console.log("Respuesta del backend (eliminar usuario):", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar usuario:", error.response || error);
      throw error;
    }
  },

  findUserByEmail: async (email) => {
    try {
      console.log(`Intentando buscar usuario con email: ${email}`);
      const response = await instance.get(`/find-user-by-email/${email}`);
      console.log(
        "Respuesta del backend (buscar usuario por email):",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error al buscar usuario por email:",
        error.response || error
      );
      throw error;
    }
  },
};

export default UserService;
