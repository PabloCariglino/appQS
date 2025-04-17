import api from "../auth/AxiosServerConfig";

const OperatorProfileService = {
  getOperatorId: async () => {
    try {
      const response = await api.get("/auth/current-user");
      return response.data.userID;
    } catch (error) {
      console.error("Error al obtener el ID del operador:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al obtener el ID del operador.",
      };
    }
  },

  assignPart: async (partId) => {
    try {
      const operatorIdResponse = await OperatorProfileService.getOperatorId();
      if (!operatorIdResponse || typeof operatorIdResponse !== "number") {
        return operatorIdResponse;
      }
      const operatorId = operatorIdResponse;

      const response = await api.post(
        `/part-tracking/start/${partId}/${operatorId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al asignar la pieza.",
      };
    }
  },

  getOperatorTasks: async () => {
    try {
      const operatorIdResponse = await OperatorProfileService.getOperatorId();
      if (!operatorIdResponse || typeof operatorIdResponse !== "number") {
        return operatorIdResponse;
      }
      const operatorId = operatorIdResponse;

      const response = await api.get(
        `/part-tracking/by-operator/${operatorId}`
      );
      const currentTasks = response.data.filter((task) => !task.isCompleted);
      const completedTasks = response.data.filter((task) => task.isCompleted);

      return {
        success: true,
        data: { currentTasks, completedTasks },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al obtener las tareas.",
      };
    }
  },

  completeTask: async (trackingId) => {
    try {
      const operatorIdResponse = await OperatorProfileService.getOperatorId();
      if (!operatorIdResponse || typeof operatorIdResponse !== "number") {
        return operatorIdResponse;
      }
      const operatorId = operatorIdResponse;

      // Fetch the tracking record to get the partId
      const trackingResponse = await api.get(`/part-tracking/${trackingId}`);
      if (!trackingResponse.data?.part?.id) {
        return {
          success: false,
          message: "No se encontró la pieza asociada a esta tarea.",
        };
      }
      const partId = trackingResponse.data.part.id;

      // Complete the task
      const response = await api.post(
        `/part-tracking/complete/${partId}/${operatorId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al completar la tarea.",
      };
    }
  },
};

export default OperatorProfileService;
