import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import BackButton from "../../fragments/BackButton";

const PartFromProject = () => {
  const { projectId } = useParams(); // ID del proyecto desde la URL
  const [parts, setParts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/project/${projectId}/parts`
        );
        setParts(response.data);
      } catch (err) {
        setError(
          "Hubo un error al obtener las piezas. Verifica la conexión o permisos."
        );
        console.error("Error fetching parts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, [projectId]);

  if (loading) return <div>Cargando...</div>;

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <Container className="mt-4">
      <h2>Piezas del Proyecto {projectId}</h2>
      {parts.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado de Recepción</th>
              <th>Control de Calidad</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part) => (
              <tr key={part.id}>
                <td>{part.id}</td>
                <td>{part.customPart?.customPart || "Sin nombre"}</td>
                <td>{part.receptionState ? "Recibida" : "Pendiente"}</td>
                <td>{part.qualityControlState ? "Aprobado" : "Rechazado"}</td>
                <td>{part.observations || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="alert alert-info">
          No hay piezas asociadas a este proyecto.
        </div>
      )}
      <BackButton />
    </Container>
  );
};

export default PartFromProject;
