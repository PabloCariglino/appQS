// PartService.js
import api from "../auth/AxiosServerConfig";

const PartService = {
  // Actualizar una pieza
  updatePart: async (id, partData) => {
    if (import.meta.env.MODE === "development") {
      console.log(`updatePart: Actualizando pieza con ID: ${id}`);
    }
    return await handleServiceCall(() =>
      api.put(`/part/${id}/update`, partData)
    );
  },

  // Eliminar una pieza (ya usada en ProjectDetail.jsx)
  deletePart: async (id) => {
    if (import.meta.env.MODE === "development") {
      console.log(`deletePart: Eliminando pieza con ID: ${id}`);
    }
    return await handleServiceCall(() => api.delete(`/part/${id}/delete`));
  },

  // Nueva función: Obtener una pieza por ID (para el escaneo)
  getPartById: async (id) => {
    if (import.meta.env.MODE === "development") {
      console.log(`getPartById: Obteniendo pieza con ID: ${id}`);
    }
    return await handleServiceCall(() => api.get(`/part/${id}`));
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
