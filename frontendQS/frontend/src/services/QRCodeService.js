import api from "../auth/AxiosServerConfig";

// Función para generar el QR
const generateQRCode = async (partData) => {
  console.log("generateQRCode: Generando código QR...");
  return await handleServiceCall(() => api.post("/qr/generate-qr", partData));
};

// Obtener QR por archivo
const getQRCodeImage = async (filename) => {
  console.log("getQRCodeImage: Obteniendo imagen del QR para", filename);
  try {
    const response = await api.get(`/../../qr-codes/${filename}`, {
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
  return await handleServiceCall(() => api.delete(`/qr/delete-qr/${qrCodeId}`));
};

// Actualizar QR
const updateQRCode = async (qrCodeId, qrData) => {
  console.log(`updateQRCode: Actualizando QR con ID: ${qrCodeId}`);
  return await handleServiceCall(() =>
    api.put(`/qr/update-qr/${qrCodeId}`, qrData)
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
