import axios from "axios";

const API_URL = "http://localhost:8080/api/projects";

const ProjectService = {
  // Obtener todos los proyectos, retornando la lista de proyectos
  fetchProjects: async () => {
    try {
      const response = await axios.get(API_URL);
      return { success: true, data: response.data }; // Retorna un objeto con más contexto
    } catch (error) {
      return handleServiceError(error); // Centraliza manejo de errores
    }
  },

  // Obtener un proyecto por ID
  fetchProjectById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  // Actualizar proyecto
  updateProjectById: async (id, projectData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, projectData);
      return { success: true, data: response.data };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  // Crear un nuevo proyecto
  createNewProject: async (newProject) => {
    try {
      const response = await axios.post(API_URL, newProject);
      return { success: true, data: response.data };
    } catch (error) {
      return handleServiceError(error);
    }
  },
};

// Manejo centralizado de errores
const handleServiceError = (error) => {
  console.error("Service error:", error);
  return { success: false, message: error.message || "Unknown error" };
};

export default ProjectService;
