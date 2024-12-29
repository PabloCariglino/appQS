import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../../fragments/BackButton";

const ProjectEdit = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      const token = getAccessToken();

      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/api/project/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProject(response.data);
      } catch (error) {
        setError("Error al obtener los datos del proyecto.");
        console.error("Error fetching project data:", error);
      }
    };

    fetchProject();
  }, [id]);

  const handleSave = async () => {
    if (!project.projectName || !project.clientAlias || !project.contact) {
      setError("Por favor, complete todos los campos requeridos.");
      return;
    }

    const token = getAccessToken();

    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/project/${id}/update`,
        project,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Proyecto actualizado con éxito.");
      navigate(`/projects/${id}`);
    } catch (error) {
      setError("Error al guardar los cambios del proyecto.");
      console.error("Error saving project data:", error);
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!project) return <div>Cargando...</div>;

  return (
    <div className="container mt-4">
      <h1>Editar Proyecto</h1>
      <div className="mb-3">
        <label>Nombre del Proyecto:</label>
        <input
          type="text"
          value={project.projectName}
          onChange={(e) =>
            setProject({ ...project, projectName: e.target.value })
          }
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label>Alias del Cliente:</label>
        <input
          type="text"
          value={project.clientAlias}
          onChange={(e) =>
            setProject({ ...project, clientAlias: e.target.value })
          }
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label>Contacto:</label>
        <input
          type="text"
          value={project.contact}
          onChange={(e) => setProject({ ...project, contact: e.target.value })}
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label>Estado:</label>
        <select
          value={project.state}
          onChange={(e) =>
            setProject({ ...project, state: e.target.value === "true" })
          }
          className="form-control"
        >
          <option value="true">Finalizado</option>
          <option value="false">En proceso</option>
        </select>
      </div>
      <button onClick={handleSave} className="btn btn-success">
        Guardar Cambios
      </button>
      <button
        onClick={() => navigate(`/projects/${id}`)}
        className="btn btn-secondary ml-2"
      >
        Cancelar
      </button>
      <BackButton />
    </div>
  );
};

export default ProjectEdit;
