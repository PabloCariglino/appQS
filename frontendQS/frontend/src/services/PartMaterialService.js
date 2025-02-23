// PartMaterialService.js
import axios from "axios";
import { getAccessToken } from "../auth/AuthService";

const API_URL = "http://localhost:8080/api/part-materials";
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

const PartMaterialService = {
  fetchPartMaterials: async () => {
    console.log("Obteniendo lista de materiales...");
    try {
      const response = await instance.get("/material-list");
      console.log("Materiales recibidos:", response.data);
      return response.data.map((material) => ({
        id: material.id,
        materialName: material.materialName, // Asegúrate de incluir el nombre
      }));
    } catch (error) {
      console.error("Error al obtener materiales:", error);
      throw error;
    }
  },
};

export default PartMaterialService;
