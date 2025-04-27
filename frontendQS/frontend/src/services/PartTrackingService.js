import api from "../auth/AxiosServerConfig";

const PartTrackingService = {
  getOperatorId: async () => {
    try {
      const response = await api.get("/auth/current-user");
      if (!response.data || typeof response.data.userID !== "number") {
        throw new Error("ID del operador no válido.");
      }
      return response.data.userID;
    } catch (error) {
      console.error("Error al obtener el ID del operador:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al obtener el ID del operador. Verifica tu sesión.",
      };
    }
  },

  takePart: async (partId) => {
    try {
      const operatorIdResponse = await PartTrackingService.getOperatorId();
      if (!operatorIdResponse || typeof operatorIdResponse !== "number") {
        return operatorIdResponse;
      }
      const operatorId = operatorIdResponse;

      const response = await api.post(
        `/part-tracking/take/${partId}/${operatorId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al tomar la pieza.",
      };
    }
  },

  completePart: async (partId) => {
    try {
      const operatorIdResponse = await PartTrackingService.getOperatorId();
      if (!operatorIdResponse || typeof operatorIdResponse !== "number") {
        return operatorIdResponse;
      }
      const operatorId = operatorIdResponse;

      const response = await api.put(
        `/part-tracking/complete/${partId}/${operatorId}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al completar la pieza.",
      };
    }
  },

  getUserTasks: async () => {
    try {
      const operatorIdResponse = await PartTrackingService.getOperatorId();
      if (!operatorIdResponse || typeof operatorIdResponse !== "number") {
        return operatorIdResponse;
      }
      const operatorId = operatorIdResponse;

      // Obtener todas las tareas (completadas y no completadas)
      const response = await api.get(`/part-tracking/history/${operatorId}`);
      if (!Array.isArray(response.data)) {
        throw new Error("La respuesta del servidor no es un array de tareas.");
      }

      const currentTasks = response.data.filter((task) => !task.completed);
      const completedTasks = response.data.filter((task) => task.completed);

      return {
        success: true,
        data: { currentTasks, completedTasks },
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Error al obtener las tareas.",
      };
    }
  },

  getActiveTasks: async () => {
    try {
      const operatorIdResponse = await PartTrackingService.getOperatorId();
      if (!operatorIdResponse || typeof operatorIdResponse !== "number") {
        return operatorIdResponse;
      }
      const operatorId = operatorIdResponse;

      const response = await api.get(`/part-tracking/active/${operatorId}`);
      if (!Array.isArray(response.data)) {
        throw new Error(
          "La respuesta del servidor no es un array de tareas activas."
        );
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Error al obtener las tareas activas.",
      };
    }
  },

  getUserMetrics: async () => {
    try {
      const operatorIdResponse = await PartTrackingService.getOperatorId();
      if (!operatorIdResponse || typeof operatorIdResponse !== "number") {
        return operatorIdResponse;
      }
      const operatorId = operatorIdResponse;

      const response = await api.get(`/part-tracking/metrics/${operatorId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Error al obtener las métricas.",
      };
    }
  },
};

export default PartTrackingService;
