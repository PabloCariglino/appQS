import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import projectService from "../../services/ProjectService";

const ProjectEdit = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await projectService.fetchProjectById(id);
        setProject(data);
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

    try {
      await projectService.updateProjectById(id, project);
      alert("Proyecto actualizado con éxito.");
      navigate(`/projects/${id}`); // Redirige a la vista del proyecto
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
    </div>
  );
};

export default ProjectEdit;
