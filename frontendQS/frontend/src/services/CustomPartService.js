//CustomPartService.js
import api from "../auth/AxiosServerConfig"; // Reemplazar axios por api

const CustomPartService = {
  fetchCustomParts: async () => {
    console.log("Obteniendo lista de piezas personalizadas...");
    try {
      const response = await api.get("/customParts/custom-part-list"); // Ajustar la ruta completa
      console.log("Piezas personalizadas recibidas:", response.data);
      return response.data.map((part) => ({
        id: part.id,
        customPartName: part.customPartName,
        imageFilePath: part.imageFilePath,
      }));
    } catch (error) {
      console.error("Error al obtener piezas personalizadas:", error);
      throw error;
    }
  },

  fetchCustomPartById: async (id) => {
    console.log(`Obteniendo pieza personalizada con ID ${id}...`);
    try {
      const response = await api.get(`/customParts/${id}`); // Ajustar la ruta completa
      console.log("Pieza personalizada recibida:", response.data);
      return {
        id: response.data.id,
        customPartName: response.data.customPartName,
        imageFilePath: response.data.imageFilePath,
      };
    } catch (error) {
      console.error("Error al obtener la pieza personalizada:", error);
      throw error;
    }
  },

  createCustomPart: async (customPartName, imageFile) => {
    console.log("Creando nueva pieza personalizada...");
    const formData = new FormData();
    formData.append("customPartName", customPartName);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await api.post("/customParts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Pieza personalizada creada:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al crear pieza personalizada:", error);
      throw error;
    }
  },

  updateCustomPart: async (id, customPartName, imageFile) => {
    console.log(`Actualizando pieza personalizada con ID ${id}...`);
    const formData = new FormData();
    if (customPartName) formData.append("customPartName", customPartName);
    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await api.put(`/customParts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Pieza personalizada actualizada:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar pieza personalizada:", error);
      throw error;
    }
  },

  deleteCustomPart: async (id) => {
    console.log(`Eliminando pieza personalizada con ID ${id}...`);
    try {
      await api.delete(`/customParts/${id}`);
      console.log("Pieza personalizada eliminada exitosamente.");
    } catch (error) {
      console.error("Error al eliminar pieza personalizada:", error);
      throw error;
    }
  },

  uploadImage: async (id, imageFile) => {
    console.log(`Subiendo imagen para pieza personalizada con ID ${id}...`);
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await api.post(
        `/customParts/${id}/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Imagen subida exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error;
    }
  },
};

export default CustomPartService;
