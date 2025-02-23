// QrCodeService.js
import axios from "axios";
import { getAccessToken } from "../auth/AuthService";

// Configuración base de Axios para QR
const API_URL = "http://localhost:8080/api/qr";
const instance = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token JWT a todas las solicitudes
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken(); // Usar getAccessToken() en lugar de sessionStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Agrega el token al encabezado
      console.log("Token enviado en la solicitud:", token); // Log para verificar el token
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
  return await handleServiceCall(
    () => instance.post("/generate-qr", partData) // Envía el objeto partData completo
  );
};

// Obtener QR por archivo
const getQRCodeImage = async (filename) => {
  console.log("getQRCodeImage: Obteniendo imagen del QR...");
  const token = getAccessToken(); // Asegúrate de obtener el token JWT
  return await handleServiceCall(() =>
    instance.get(`/qr-codes/${filename}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Pasar el token en la cabecera
      },
    })
  );
};

// Eliminar QR por ID
const deleteQRCode = async (qrCodeId) => {
  console.log(`deleteQRCode: Eliminando QR con ID: ${qrCodeId}`);
  return await handleServiceCall(
    () => instance.delete(`/delete-qr/${qrCodeId}`) // Llama al backend para eliminar el QR
  );
};

// Funciones adicionales para gestionar el CRUD de QR
const updateQRCode = async (qrCodeId, qrData) => {
  console.log(`updateQRCode: Actualizando QR con ID: ${qrCodeId}`);
  return await handleServiceCall(
    () => instance.put(`/update-qr/${qrCodeId}`, qrData) // Actualiza el QR con nuevos datos
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
