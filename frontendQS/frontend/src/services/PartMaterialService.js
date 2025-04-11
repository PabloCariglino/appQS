// PartMaterialService.js
import api from "../auth/AxiosServerConfig"; // Reemplazar axios por api

const PartMaterialService = {
  fetchPartMaterials: async () => {
    console.log("Obteniendo lista de materiales...");
    try {
      const response = await api.get("/part-materials/material-list"); // Ajustar la ruta completa
      console.log("Materiales recibidos:", response.data);
      return response.data.map((material) => ({
        id: material.id,
        materialName: material.materialName,
      }));
    } catch (error) {
      console.error("Error al obtener materiales:", error);
      throw error;
    }
  },
};

export default PartMaterialService;
