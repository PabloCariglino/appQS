import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import projectService from "./projectService"; // Importa el servicio

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await projectService.getProjectById(id); // Llama al servicio
        setProject(data);
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    fetchProject();
  }, [id]);

  if (!project) return <div>Cargando...</div>;

  return (
    <div>
      <h1>{project.projectName}</h1>
      <p>Alias del Cliente: {project.clientAlias}</p>
      <p>Estado: {project.state ? "Finalizado" : "En proceso"}</p>
      <h2>Piezas</h2>
      <ul>
        {project.pieces.map(
          (
            part // Cambié 'parts' por 'pieces' para que coincida con tu estructura de datos
          ) => (
            <li key={part.id}>
              {part.partName} -{" "}
              {part.receptionState ? "Recibida" : "No recibida"}{" "}
              {/* Asegúrate que el estado esté bien según tu estructura */}
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default ProjectDetail;
