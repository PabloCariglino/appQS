//PartScannerService.js
import api from "../auth/AxiosServerConfig";

const PartScannerService = {
  getPartById: async (partId) => {
    if (import.meta.env.MODE === "development") {
      console.log(`getPartById: Solicitando pieza con ID: ${partId}`);
    }
    return await handleServiceCall(() => api.get(`/part/${partId}`));
  },

  updatePart: async (partId, partData) => {
    if (import.meta.env.MODE === "development") {
      console.log(`updatePart: Actualizando pieza con ID: ${partId}`);
    }
    return await handleServiceCall(() =>
      api.put(`/part/${partId}/update`, partData)
    );
  },

  getPartImage: async (imagePath) => {
    if (import.meta.env.MODE === "development") {
      console.log(`getPartImage: Solicitando imagen: ${imagePath}`);
    }
    try {
      const response = await api.get(`/image-custom-part/${imagePath}`, {
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
      api.post(`/scanned-parts`, scannedPart)
    );
  },

  getScannedParts: async () => {
    if (import.meta.env.MODE === "development") {
      console.log(`getScannedParts: Solicitando piezas escaneadas`);
    }
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const since = oneWeekAgo.toISOString();
    return await handleServiceCall(() =>
      api.get(`/scanned-parts?since=${since}`)
    );
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
