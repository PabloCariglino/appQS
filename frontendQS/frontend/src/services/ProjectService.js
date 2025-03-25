// ProjectService.js (optimizado para Vite/React)
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
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      if (import.meta.env.MODE === "development") {
        console.log("Token enviado en la solicitud:", token); // Log solo en desarrollo
      }
    } else {
      if (import.meta.env.MODE === "development") {
        console.warn("Token no disponible para la solicitud.");
      }
    }
    return config;
  },
  (error) => {
    if (import.meta.env.MODE === "development") {
      console.error("Error en el interceptor de la solicitud:", error);
    }
    return Promise.reject(error);
  }
);

// Funciones de servicio para interactuar con el backend
const ProjectService = {
  // Crear un nuevo proyecto con las piezas
  createNewProject: async (projectDto, partDtos) => {
    if (import.meta.env.MODE === "development") {
      console.log("createNewProject: Creando un nuevo proyecto...");
    }
    const data = { project: projectDto, parts: partDtos };
    try {
      const response = await instance.post("/create", data);
      return {
        success: true,
        data: {
          project: response.data, // El backend devuelve directamente el Project
          parts: response.data.parts || [], // Asegúrate de que el backend devuelva las piezas con qrCodeFilePath
        },
      };
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error(
          "Error al crear proyecto:",
          error.response?.data || error.message
        );
      }
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error desconocido al crear el proyecto",
      };
    }
  },

  // Obtener todos los proyectos
  fetchProjects: async () => {
    if (import.meta.env.MODE === "development") {
      console.log("fetchProjects: Realizando llamada al backend...");
    }
    return await handleServiceCall(() => instance.get("/list"));
  },

  // Obtener un proyecto por ID
  fetchProjectById: async (id) => {
    if (import.meta.env.MODE === "development") {
      console.log(`fetchProjectById: Solicitando proyecto con ID: ${id}`);
    }
    return await handleServiceCall(() => instance.get(`/${id}`));
  },

  // Actualizar un proyecto
  updateProjectById: async (id, projectData) => {
    if (import.meta.env.MODE === "development") {
      console.log(`updateProjectById: Actualizando proyecto con ID: ${id}`);
    }
    return await handleServiceCall(() =>
      instance.put(`/${id}/update`, projectData)
    );
  },

  // Actualizar un proyecto
  updateProject: async (id, projectData) => {
    if (import.meta.env.MODE === "development") {
      console.log(`updateProject: Actualizando proyecto con ID: ${id}`);
    }
    return await handleServiceCall(() =>
      instance.patch(`/${id}/update`, projectData)
    );
  },
};

// Manejo centralizado de errores y respuesta
const handleServiceCall = async (apiCall) => {
  try {
    const response = await apiCall();
    if (import.meta.env.MODE === "development") {
      console.log("handleServiceCall: Respuesta exitosa:", response.data);
    }
    return { success: true, data: response.data };
  } catch (error) {
    if (import.meta.env.MODE === "development") {
      console.error(
        "handleServiceCall: Error al realizar la llamada:",
        error.response?.data || error.message
      );
    }
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Error desconocido",
    };
  }
};

export default ProjectService;
