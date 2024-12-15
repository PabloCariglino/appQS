// UserService.js
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
    console.log("Interceptor: Token recuperado de localStorage:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Agrega el token a los encabezados
      console.log(
        "Interceptor: Token agregado a los headers:",
        config.headers.Authorization
      );
    } else {
      console.warn("Interceptor: No se encontró token en localStorage");
    }
    return config;
  },
  (error) => {
    console.error("Interceptor: Error al configurar la solicitud", error);
    return Promise.reject(error);
  }
);

// Funciones de servicio para interactuar con el backend
const UserService = {
  // Registrar un nuevo usuario
  registerUser: async (userDto) => {
    console.log("registerUser: Registrando un nuevo usuario...");
    console.log("Datos enviados:", userDto);
    return await handleServiceCall(() =>
      instance.post("/register-user", userDto)
    );
  },

  // Actualizar un usuario existente
  updateUser: async (id, userUpdateDto) => {
    console.log(`updateUser: Actualizando usuario con ID ${id}...`);
    console.log("Datos enviados:", userUpdateDto);
    return await handleServiceCall(() =>
      instance.put(`/update-user/${id}`, userUpdateDto)
    );
  },

  // Cambiar el estado de un usuario
  changeUserStatus: async (id) => {
    console.log(
      `changeUserStatus: Cambiando el estado del usuario con ID ${id}...`
    );
    return await handleServiceCall(() =>
      instance.patch(`/change-user-status/${id}`)
    );
  },

  // Listar todos los usuarios
  listUsers: async () => {
    console.log("listUsers: Solicitando lista de usuarios...");
    return await handleServiceCall(() => instance.get("/user-list"));
  },

  // Buscar usuario por ID
  findUserById: async (id) => {
    console.log(`findUserById: Buscando usuario con ID ${id}...`);
    return await handleServiceCall(() => instance.get(`/find-user/${id}`));
  },

  // Buscar usuario por email
  findUserByEmail: async (email) => {
    console.log(`findUserByEmail: Buscando usuario con email ${email}...`);
    return await handleServiceCall(() =>
      instance.get(`/find-user-by-email/${email}`)
    );
  },
};

// Manejo centralizado de errores y respuesta
const handleServiceCall = async (apiCall) => {
  try {
    console.log("handleServiceCall: Realizando llamada al backend...");
    const response = await apiCall();
    console.log("handleServiceCall: Respuesta exitosa:", response);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("handleServiceCall: Error al realizar la llamada:", error);
    console.error("Detalles del error:", {
      message: error.message,
      response: error.response,
    });

    if (error.response?.status === 403) {
      console.warn("handleServiceCall: Error 403 - Acceso prohibido.");
    }

    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

export default UserService;
