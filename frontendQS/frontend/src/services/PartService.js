import axios from "axios";
import { getAccessToken } from "../auth/AuthService";

const API_URL = "http://localhost:8080/api/part";
const instance = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token JWT
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      if (import.meta.env.MODE === "development") {
        console.log("Token enviado en la solicitud:", token);
      }
    } else {
      if (import.meta.env.MODE === "development") {
        console.warn("Token no disponible para la solicitud.");
      }
    }
    return config;
  },
  (error) => {
    if (import.meta.env.MODE === "development") {
      console.error("Error en el interceptor de la solicitud:", error);
    }
    return Promise.reject(error);
  }
);

const PartService = {
  // Actualizar una pieza
  updatePart: async (id, partData) => {
    if (import.meta.env.MODE === "development") {
      console.log(`updatePart: Actualizando pieza con ID: ${id}`);
    }
    return await handleServiceCall(() =>
      instance.put(`/${id}/update`, partData)
    );
  },

  // Eliminar una pieza (ya usada en ProjectDetail.jsx)
  deletePart: async (id) => {
    if (import.meta.env.MODE === "development") {
      console.log(`deletePart: Eliminando pieza con ID: ${id}`);
    }
    return await handleServiceCall(() => instance.delete(`/${id}/delete`));
  },

  // Nueva función: Obtener una pieza por ID (para el escaneo)
  getPartById: async (id) => {
    if (import.meta.env.MODE === "development") {
      console.log(`getPartById: Obteniendo pieza con ID: ${id}`);
    }
    return await handleServiceCall(() => instance.get(`/${id}`));
  },
};

// Manejo centralizado de errores y respuesta
const handleServiceCall = async (apiCall) => {
  try {
    const response = await apiCall();
    if (import.meta.env.MODE === "development") {
      console.log("handleServiceCall: Respuesta exitosa:", response.data);
    }
    return { success: true, data: response.data };
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error(
        "handleServiceCall: Error al realizar la llamada:",
        error.response?.data || error.message
      );
    }
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Error desconocido",
    };
  }
};

export default PartService;
