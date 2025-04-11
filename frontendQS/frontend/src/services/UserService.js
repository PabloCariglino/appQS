import api from "./AxiosServerConfig";

const UserService = {
  registerUser: async (userDto) => {
    try {
      console.log("Intentando registrar usuario con datos:", userDto);
      const response = await api.post("/user-dashboard/register-user", userDto);
      console.log("Respuesta del backend (registro usuario):", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al registrar usuario:", error.response || error);
      throw error;
    }
  },

  updateUser: async (id, userUpdateDto) => {
    try {
      console.log(`Intentando actualizar usuario con ID: ${id}`, userUpdateDto);
      const response = await api.put(
        `/user-dashboard/update-user/${id}`,
        userUpdateDto
      );
      console.log("Respuesta del backend (actualizar usuario):", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar usuario:", error.response || error);
      throw error;
    }
  },

  changeUserStatus: async (id) => {
    try {
      console.log(`Intentando cambiar estado del usuario con ID: ${id}`);
      const response = await api.patch(
        `/user-dashboard/change-user-status/${id}`
      );
      console.log("Respuesta del backend (cambiar estado):", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error al cambiar estado del usuario:",
        error.response || error
      );
      throw error;
    }
  },

  listUsers: async () => {
    try {
      console.log("Intentando listar usuarios...");
      const response = await api.get("/user-dashboard/user-list");
      console.log("Respuesta del backend (listar usuarios):", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al listar usuarios:", error.response || error);
      throw error;
    }
  },

  findUserById: async (id) => {
    try {
      console.log(`Intentando buscar usuario con ID: ${id}`);
      const response = await api.get(`/user-dashboard/find-user/${id}`);
      console.log(
        "Respuesta del backend (buscar usuario por ID):",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Error al buscar usuario por ID:", error.response || error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      console.log(`Intentando eliminar usuario con ID: ${id}`);
      const response = await api.delete(`/user-dashboard/delete-user/${id}`);
      console.log("Respuesta del backend (eliminar usuario):", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar usuario:", error.response || error);
      throw error;
    }
  },

  findUserByEmail: async (email) => {
    try {
      console.log(`Intentando buscar usuario con email: ${email}`);
      const response = await api.get(
        `/user-dashboard/find-user-by-email/${email}`
      );
      console.log(
        "Respuesta del backend (buscar usuario por email):",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error al buscar usuario por email:",
        error.response || error
      );
      throw error;
    }
  },
};

export default UserService;
