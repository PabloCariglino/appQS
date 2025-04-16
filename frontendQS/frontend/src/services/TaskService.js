// TaskService.js
import api from "../auth/AxiosServerConfig";

const TaskService = {
  getAllTasksByState: async () => {
    if (import.meta.env.MODE === "development") {
      console.log(
        "getAllTasksByState: Solicitando piezas agrupadas por estado..."
      );
    }
    return await handleServiceCall(() =>
      api.get("/part-tracking/by-all-states")
    );
  },

  // getTasksByState: async (state) => {
  //   if (import.meta.env.MODE === "development") {
  //     console.log(`getTasksByState: Solicitando piezas con estado: ${state}`);
  //   }
  //   return await handleServiceCall(() =>
  //     api.get(`/part-tracking/by-state/${state}`)
  //   );
  // },
};

const handleServiceCall = async (apiCall) => {
  try {
    const response = await apiCall();
    if (import.meta.env.MODE === "development") {
      console.log(
        "handleServiceCall (TaskService): Respuesta exitosa:",
        response.data
      );
    }
    return { success: true, data: response.data };
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error(
        "handleServiceCall (TaskService): Error al realizar la llamada:",
        error.response?.data || error.message
      );
    }
    return {
      success: false,
      message:
        error.response?.data ||
        error.message ||
        "Error desconocido al cargar las tareas",
    };
  }
};

export default TaskService;
