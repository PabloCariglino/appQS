import axios from "axios";
import { getAccessToken } from "../auth/AuthService";

const API_URL = "http://localhost:8080/api";
const instance = axios.create({
  baseURL: API_URL,
});

instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      if (import.meta.env.MODE === "development") {
        console.log(
          "Token enviado en la solicitud (PartScannerService):",
          token
        );
      }
    } else {
      if (import.meta.env.MODE === "development") {
        console.warn(
          "Token no disponible para la solicitud (PartScannerService)."
        );
      }
    }
    return config;
  },
  (error) => {
    if (import.meta.env.MODE === "development") {
      console.error(
        "Error en el interceptor de la solicitud (PartScannerService):",
        error
      );
    }
    return Promise.reject(error);
  }
);

const PartScannerService = {
  getPartById: async (partId) => {
    if (import.meta.env.MODE === "development") {
      console.log(`getPartById: Solicitando pieza con ID: ${partId}`);
    }
    return await handleServiceCall(() => instance.get(`/part/${partId}`));
  },

  updatePart: async (partId, partData) => {
    if (import.meta.env.MODE === "development") {
      console.log(`updatePart: Actualizando pieza con ID: ${partId}`);
    }
    return await handleServiceCall(() =>
      instance.put(`/part/${partId}/update`, partData)
    );
  },

  getPartImage: async (imagePath) => {
    if (import.meta.env.MODE === "development") {
      console.log(`getPartImage: Solicitando imagen: ${imagePath}`);
    }
    try {
      const response = await instance.get(`/image-custom-part/${imagePath}`, {
        responseType: "blob",
      });
      if (import.meta.env.MODE === "development") {
        console.log("Imagen cargada exitosamente:", response);
      }
      return { success: true, data: URL.createObjectURL(response.data) };
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error(
          "Error al cargar la imagen:",
          error.response?.data || error.message
        );
      }
      return {
        success: false,
        message: error.response?.data?.message || "Error al cargar la imagen",
      };
    }
  },

  saveScannedPart: async (scannedPart) => {
    if (import.meta.env.MODE === "development") {
      console.log(`saveScannedPart: Guardando pieza escaneada:`, scannedPart);
    }
    return await handleServiceCall(() =>
      instance.post(`/scanned-parts`, scannedPart)
    );
  },

  getScannedParts: async () => {
    if (import.meta.env.MODE === "development") {
      console.log(`getScannedParts: Solicitando piezas escaneadas`);
    }
    return await handleServiceCall(() => instance.get(`/scanned-parts`));
  },
};

const handleServiceCall = async (apiCall) => {
  try {
    const response = await apiCall();
    if (import.meta.env.MODE === "development") {
      console.log(
        "handleServiceCall (PartScannerService): Respuesta exitosa:",
        response.data
      );
    }
    return { success: true, data: response.data };
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error(
        "handleServiceCall (PartScannerService): Error al realizar la llamada:",
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

export default PartScannerService;
