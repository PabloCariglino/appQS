// ProjectService.js
import axios from "axios";
import { getAccessToken } from "../auth/AuthService";

// Configuración base de Axios para proyectos
const API_URL = "http://localhost:8080/api/project";
const instance = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token JWT a todas las solicitudes
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken(); // Usar getAccessToken() en lugar de sessionStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Agrega el token al encabezado
      console.log("Token enviado en la solicitud:", token); // Log para verificar el token
    } else {
      console.warn("Token no disponible para la solicitud.");
    }
    return config;
  },
  (error) => {
    console.error("Error en el interceptor de la solicitud:", error);
    return Promise.reject(error);
  }
);

// Funciones de servicio para interactuar con el backend
const ProjectService = {
  // Crear un nuevo proyecto con las piezas
  createNewProject: async (projectDto, partDtos) => {
    console.log("createNewProject: Creando un nuevo proyecto...");
    const data = { project: projectDto, parts: partDtos };
    return await handleServiceCall(() => instance.post("/create", data));
  },

  // Obtener todos los proyectos
  fetchProjects: async () => {
    console.log("fetchProjects: Realizando llamada al backend...");
    return await handleServiceCall(() => instance.get("/list"));
  },

  // Obtener un proyecto por ID
  fetchProjectById: async (id) => {
    console.log(`fetchProjectById: Solicitando proyecto con ID: ${id}`);
    return await handleServiceCall(() => instance.get(`/${id}`));
  },

  // Actualizar un proyecto
  updateProjectById: async (id, projectData) => {
    console.log(`updateProjectById: Actualizando proyecto con ID: ${id}`);
    return await handleServiceCall(() =>
      instance.put(`/${id}/update`, projectData)
    );
  },
};

// Manejo centralizado de errores y respuesta
const handleServiceCall = async (apiCall) => {
  try {
    const response = await apiCall();
    console.log("handleServiceCall: Respuesta exitosa:", response);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("handleServiceCall: Error al realizar la llamada:", error);
    console.error("Detalles del error:", error.response);
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Error desconocido",
    };
  }
};

export default ProjectService;
