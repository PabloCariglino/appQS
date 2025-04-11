// ProjectService.js
import api from "../auth/AxiosServerConfig";

const ProjectService = {
  // Crear un nuevo proyecto con las piezas
  createNewProject: async (projectDto, partDtos) => {
    if (import.meta.env.MODE === "development") {
      console.log("createNewProject: Creando un nuevo proyecto...");
    }
    const data = { project: projectDto, parts: partDtos };
    try {
      const response = await api.post("/project/create", data);
      return {
        success: true,
        data: {
          project: response.data,
          parts: response.data.parts || [],
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
    return await handleServiceCall(() => api.get("/project/list"));
  },

  // Obtener un proyecto por ID
  fetchProjectById: async (id) => {
    if (import.meta.env.MODE === "development") {
      console.log(`fetchProjectById: Solicitando proyecto con ID: ${id}`);
    }
    return await handleServiceCall(() => api.get(`/project/${id}`));
  },

  // Actualizar un proyecto
  updateProjectById: async (id, projectData) => {
    if (import.meta.env.MODE === "development") {
      console.log(`updateProjectById: Actualizando proyecto con ID: ${id}`);
    }
    return await handleServiceCall(() =>
      api.put(`/project/${id}/update`, projectData)
    );
  },

  // Actualizar un proyecto (parcialmente con PATCH)
  updateProject: async (id, projectData) => {
    if (import.meta.env.MODE === "development") {
      console.log(`updateProject: Actualizando proyecto con ID: ${id}`);
    }
    return await handleServiceCall(() =>
      api.patch(`/project/${id}/update`, projectData)
    );
  },

  // Eliminar un proyecto
  deleteProject: async (id) => {
    if (import.meta.env.MODE === "development") {
      console.log(`deleteProject: Eliminando proyecto con ID: ${id}`);
    }
    return await handleServiceCall(() => api.delete(`/project/${id}/delete`));
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
