import axios from "axios";
import { getAccessToken } from "../auth/AuthService";

const API_URL = "http://localhost:8080/api/customParts";
const instance = axios.create({ baseURL: API_URL });

// Interceptor para agregar el token JWT
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Token enviado:", token);
    } else {
      console.warn("No se encontró token para la solicitud.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const CustomPartService = {
  fetchCustomParts: async () => {
    console.log("Obteniendo lista de piezas personalizadas...");
    try {
      const response = await instance.get("/custom-part-list");
      console.log("Piezas personalizadas recibidas:", response.data);
      return response.data.map((part) => ({
        id: part.id,
        customPartName: part.customPartName,
        imageFilePath: part.imageFilePath,
      }));
    } catch (error) {
      console.error("Error al obtener piezas personalizadas:", error);
      throw error;
    }
  },

  fetchCustomPartById: async (id) => {
    console.log(`Obteniendo pieza personalizada con ID ${id}...`);
    try {
      const response = await instance.get(`/${id}`);
      console.log("Pieza personalizada recibida:", response.data);
      return {
        id: response.data.id,
        customPartName: response.data.customPartName,
        imageFilePath: response.data.imageFilePath,
      };
    } catch (error) {
      console.error("Error al obtener la pieza personalizada:", error);
      throw error;
    }
  },

  createCustomPart: async (customPartName, imageFile) => {
    console.log("Creando nueva pieza personalizada...");
    const formData = new FormData();
    formData.append("customPartName", customPartName);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await instance.post("", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Pieza personalizada creada:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al crear pieza personalizada:", error);
      throw error;
    }
  },

  updateCustomPart: async (id, customPartName, imageFile) => {
    console.log(`Actualizando pieza personalizada con ID ${id}...`);
    const formData = new FormData();
    if (customPartName) formData.append("customPartName", customPartName);
    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await instance.put(`/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Pieza personalizada actualizada:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar pieza personalizada:", error);
      throw error;
    }
  },

  deleteCustomPart: async (id) => {
    console.log(`Eliminando pieza personalizada con ID ${id}...`);
    try {
      await instance.delete(`/${id}`);
      console.log("Pieza personalizada eliminada exitosamente.");
    } catch (error) {
      console.error("Error al eliminar pieza personalizada:", error);
      throw error;
    }
  },

  uploadImage: async (id, imageFile) => {
    console.log(`Subiendo imagen para pieza personalizada con ID ${id}...`);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await instance.post(`/${id}/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Imagen subida exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error;
    }
  },
};

export default CustomPartService;
