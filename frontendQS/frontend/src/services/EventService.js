// EventService.js
import api from "../auth/AxiosServerConfig";

const EventService = {
  getAllEvents: async () => {
    try {
      const response = await api.get("/events");
      return response.data;
    } catch (error) {
      console.error("Error al obtener eventos:", error);
      throw error;
    }
  },

  createEvent: async (event) => {
    try {
      const response = await api.post("/events", event);
      return response.data;
    } catch (error) {
      console.error("Error al crear evento:", error);
      throw error;
    }
  },

  updateEvent: async (id, event) => {
    try {
      const response = await api.put(`/events/${id}`, event);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      await api.delete(`/events/${id}`);
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      throw error;
    }
  },
};

export default EventService;
