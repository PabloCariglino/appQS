// ProjectService.js
import axios from "axios";

// Configuración base de Axios para proyectos
const API_URL = "http://localhost:8080/api/project";
const instance = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token JWT a todas las solicitudes
instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token"); // Cambia a sessionStorage
    if (token) {
      console.log("Interceptor: Token recuperado de sessionStorage:", token);
      config.headers.Authorization = `Bearer ${token}`; // Agrega el token a los encabezados
    } else {
      console.warn("Interceptor: No se encontró token en sessionStorage");
    }
    console.log("Request headers:", config.headers);

    return config;
  },
  (error) => Promise.reject(error)
);

// Funciones de servicio para interactuar con el backend
const ProjectService = {
  // Obtener todos los proyectos
  fetchProjects: async () => {
    console.log("fetchProjects: Realizando llamada al backend...");
    return await handleServiceCall(() => instance.get("/projects-list"));
  },

  // Obtener un proyecto por ID
  fetchProjectById: async (id) => {
    return await handleServiceCall(() => instance.get(`/${id}`));
  },

  // Actualizar un proyecto
  updateProjectById: async (id, projectData) => {
    return await handleServiceCall(() =>
      instance.put(`/projects-update/${id}`, projectData)
    );
  },

  // Crear un nuevo proyecto
  createNewProject: async (newProject) => {
    return await handleServiceCall(() =>
      instance.post("/projects-create", newProject)
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
        error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

export default ProjectService;
