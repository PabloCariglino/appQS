import api from "../auth/AxiosServerConfig";

const getTasksByState = async (state) => {
  try {
    const response = await api.get(`/part-tracking/by-state/${state}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for ${state}:`, error);
    throw error;
  }
};

const getObservedTasks = async () => {
  try {
    const response = await api.get("/part-tracking/observed");
    return response.data;
  } catch (error) {
    console.error("Error fetching observed tasks:", error);
    throw error;
  }
};

export default {
  getTasksByState,
  getObservedTasks,
};
