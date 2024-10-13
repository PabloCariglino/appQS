import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import projectService from "./projectService"; // Importar el servicio

const ProjectEdit = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await projectService.getProjectById(id); // Llama al servicio para obtener el proyecto
        setProject(data);
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    fetchProject();
  }, [id]);

  const handleSave = async () => {
    try {
      await projectService.updateProject(id, project); // Llama al servicio para actualizar el proyecto
      navigate(`/projects/${id}`); // Redirige a la vista del proyecto
    } catch (error) {
      console.error("Error saving project data:", error);
    }
  };

  if (!project) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Editar Proyecto</h1>
      <input
        type="text"
        value={project.projectName}
        onChange={(e) =>
          setProject({ ...project, projectName: e.target.value })
        }
      />
      <button onClick={handleSave}>Guardar Cambios</button>
      {/* Agregar otros campos según sea necesario */}
    </div>
  );
};

export default ProjectEdit;
