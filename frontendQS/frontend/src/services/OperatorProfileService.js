import api from "../auth/AxiosServerConfig";

const assignPart = async (partId) => {
  try {
    const response = await api.post(`/operator-profile/assign-part/${partId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al asignar la pieza",
    };
  }
};

const completeTask = async (trackingId) => {
  try {
    const response = await api.post(
      `/operator-profile/complete-task/${trackingId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al completar la tarea",
    };
  }
};

const getOperatorTasks = async () => {
  try {
    const response = await api.get("/operator-profile/tasks");
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener las tareas",
    };
  }
};

const OperatorProfileService = {
  assignPart,
  completeTask,
  getOperatorTasks,
};

export default OperatorProfileService;
