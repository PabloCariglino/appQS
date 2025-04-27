// PartStateGroupService.js
import api from "../auth/AxiosServerConfig";

const PartStateGroupService = {
  getAllPartsByState: async () => {
    if (import.meta.env.MODE === "development") {
      console.log(
        "getAllPartsByState: Solicitando piezas agrupadas por estado..."
      );
    }
    return await handleServiceCall(() => api.get("/parts/by-state"));
  },
};

const handleServiceCall = async (apiCall) => {
  try {
    const response = await apiCall();
    if (import.meta.env.MODE === "development") {
      console.log(
        "handleServiceCall (PartStateGroupService): Respuesta exitosa:",
        response.data
      );
    }
    return { success: true, data: response.data };
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error(
        "handleServiceCall (PartStateGroupService): Error al realizar la llamada:",
        error.response?.data || error.message
      );
    }
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Error desconocido al cargar las piezas",
    };
  }
};

export default PartStateGroupService;
