import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProjectService from "../../services/ProjectService"; // Importa el servicio
import Footer from "../fragments/Footer";
import Navbar from "../fragments/Navbar";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await ProjectService.fetchProjectById(id);
        setProject(data);
      } catch (error) {
        setError("Error al obtener los detalles del proyecto.");
        console.error("Error fetching project data:", error);
      }
    };

    fetchProject();
  }, [id]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!project) return <div>Cargando...</div>;

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h1>Detalles del Proyecto</h1>
        <div className="mb-4">
          <p>
            <strong>Nombre del Proyecto:</strong> {project.projectName}
          </p>
          <p>
            <strong>Alias del Cliente:</strong> {project.clientAlias}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            {project.state ? "Finalizado" : "En proceso"}
          </p>
        </div>
        <h2>Piezas</h2>
        <ul className="list-group">
          {project.parts?.map((part) => (
            <li key={part.id} className="list-group-item">
              <p>
                <strong>Nombre:</strong>{" "}
                {part.customPart?.customPart || "Sin nombre"}
              </p>
              <p>
                <strong>Material:</strong>{" "}
                {part.partMaterial?.materialName || "Sin material"}
              </p>
              <p>
                <strong>Estado de Recepción:</strong>{" "}
                {part.receptionState ? "Recibida" : "No recibida"}
              </p>
              <p>
                <strong>Control de Calidad:</strong>{" "}
                {part.qualityControlState ? "Aprobado" : "Rechazado"}
              </p>
              <p>
                <strong>Observaciones:</strong> {part.observations || "N/A"}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </>
  );
};

export default ProjectDetail;
