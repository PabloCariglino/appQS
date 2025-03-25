import axios from "axios";
import { getAccessToken } from "../auth/AuthService";

// Configuración base de Axios para QR
const API_URL = "http://localhost:8080";
const instance = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token JWT a todas las solicitudes
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Token enviado en la solicitud:", token);
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

// Función para generar el QR
const generateQRCode = async (partData) => {
  console.log("generateQRCode: Generando código QR...");
  return await handleServiceCall(() =>
    instance.post("/api/qr/generate-qr", partData)
  );
};

// Obtener QR por archivo
const getQRCodeImage = async (filename) => {
  console.log("getQRCodeImage: Obteniendo imagen del QR para", filename);
  const token = getAccessToken();
  if (!token) {
    console.error("No hay token disponible para la solicitud de QR");
    return { success: false, message: "No hay token disponible (401)" };
  }
  try {
    const response = await instance.get(`/qr-codes/${filename}`, {
      responseType: "blob",
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error al obtener la imagen del QR:", error);
    if (error.response && error.response.status === 401) {
      console.error("Sesión expirada detectada en getQRCodeImage (401)");
      return { success: false, message: "Sesión expirada (401)" };
    }
    return { success: false, message: error.message };
  }
};

// Eliminar QR por ID
const deleteQRCode = async (qrCodeId) => {
  console.log(`deleteQRCode: Eliminando QR con ID: ${qrCodeId}`);
  return await handleServiceCall(() =>
    instance.delete(`/api/qr/delete-qr/${qrCodeId}`)
  );
};

// Actualizar QR
const updateQRCode = async (qrCodeId, qrData) => {
  console.log(`updateQRCode: Actualizando QR con ID: ${qrCodeId}`);
  return await handleServiceCall(() =>
    instance.put(`/api/qr/update-qr/${qrCodeId}`, qrData)
  );
};

// Manejo centralizado de errores y respuesta
const handleServiceCall = async (apiCall) => {
  try {
    const response = await apiCall();
    console.log("handleServiceCall: Respuesta exitosa:", response);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("handleServiceCall: Error al realizar la llamada:", error);
    console.error("Detalles del error:", error.response);
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Error desconocido",
    };
  }
};

export default {
  generateQRCode,
  getQRCodeImage,
  deleteQRCode,
  updateQRCode,
};
