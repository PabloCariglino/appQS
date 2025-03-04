import axios from "axios";
import { getAccessToken } from "../auth/AuthService";

const API_URL = "http://localhost:8080/api/events";

const EventService = {
  getAllEvents: async () => {
    const token = getAccessToken();
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  createEvent: async (event) => {
    const token = getAccessToken();
    const response = await axios.post(API_URL, event, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  updateEvent: async (id, event) => {
    const token = getAccessToken();
    const response = await axios.put(`${API_URL}/${id}`, event, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  deleteEvent: async (id) => {
    const token = getAccessToken();
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default EventService;
