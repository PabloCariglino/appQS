import axios from "axios";

// Configuración base de Axios
const API_URL = "http://localhost:8080/api/user-dashboard"; // Cambia esto según tu configuración
const instance = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token JWT a todas las solicitudes
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Recupera el token del localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Agrega el token a los encabezados
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Funciones de servicio para interactuar con el backend
const UserService = {
  // Registrar un nuevo usuario
  registerUser: async (userDto) => {
    try {
      const response = await instance.post("/register-user", userDto);
      return response.data; // Retorna el usuario guardado
    } catch (error) {
      throw this.handleError(error); // Manejo de errores
    }
  },

  // Actualizar un usuario existente
  updateUser: async (id, userUpdateDto) => {
    try {
      const response = await instance.put(`/update-user/${id}`, userUpdateDto);
      return response.data; // Retorna el usuario actualizado
    } catch (error) {
      throw this.handleError(error); // Manejo de errores
    }
  },

  // Cambiar el estado de un usuario
  changeUserStatus: async (id) => {
    try {
      const response = await instance.patch(`/change-user-status/${id}`);
      return response.data; // Retorna el mensaje de estado cambiado
    } catch (error) {
      throw this.handleError(error); // Manejo de errores
    }
  },

  // Listar todos los usuarios
  listUsers: async () => {
    try {
      const response = await instance.get("/user-list");
      return response.data; // Retorna la lista de usuarios
    } catch (error) {
      throw this.handleError(error); // Manejo de errores
    }
  },

  // Buscar usuario por ID
  findUserById: async (id) => {
    try {
      const response = await instance.get(`/find-user/${id}`);
      return response.data; // Retorna el usuario encontrado
    } catch (error) {
      throw this.handleError(error); // Manejo de errores
    }
  },

  // Buscar usuario por email
  findUserByEmail: async (email) => {
    try {
      const response = await instance.get(`/find-user-by-email/${email}`);
      return response.data; // Retorna el usuario encontrado
    } catch (error) {
      throw this.handleError(error); // Manejo de errores
    }
  },

  // Manejo de errores
  handleError: (error) => {
    // Verifica si hay respuesta del servidor
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango de 2xx
      return error.response.data || "Error en la solicitud";
    } else if (error.request) {
      // La solicitud fue realizada pero no se recibió respuesta
      return "No se recibió respuesta del servidor";
    } else {
      // Ocurrió un error al configurar la solicitud
      return error.message || "Error inesperado";
    }
  },
};

export default UserService;
