// CustomPartService.js
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
        customPart: part.customPart, // Asegúrate de incluir el nombre
        imageFilePath: part.imageFilePath,
      }));
    } catch (error) {
      console.error("Error al obtener piezas personalizadas:", error);
      throw error;
    }
  },
};

export default CustomPartService;
