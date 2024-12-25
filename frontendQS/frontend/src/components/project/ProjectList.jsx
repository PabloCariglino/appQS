import { useContext, useEffect, useState } from "react";
import { Button, Container, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import BackButton from "../../fragments/BackButton";
import ProjectService from "../../services/ProjectService";
import styles from "./ProjectList.module.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log("Solicitando lista de proyectos...");
        const { success, data } = await ProjectService.fetchProjects();
        if (success) {
          console.log("Lista de proyectos recibida:", data);
          setProjects(data);
        } else {
          setError("Error al cargar los proyectos.");
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        if (err.response?.status === 403) {
          setError(
            "Acceso denegado. Verifica que tienes los permisos adecuados."
          );
        } else {
          setError(
            "Error al cargar los proyectos. Por favor, intenta nuevamente."
          );
        }
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (id) => navigate(`/projects/${id}`);
  const handleCreateProject = () => navigate("/create-project");
  const handlePartCustomList = () => navigate("/PartCustom-list");
  const handleMaterialList = () => navigate("/material-list");

  return (
    <>
      <Container className={styles.tableContainer}>
        <div className={styles.buttonContainer}>
          <div className={styles.leftButtons}>
            <Button
              variant="primary"
              className={styles.createButton}
              onClick={handlePartCustomList}
            >
              Crear Pieza
            </Button>
            <Button
              variant="primary"
              className={styles.createButton}
              onClick={handleMaterialList}
            >
              Crear Material
            </Button>
          </div>
          <div className={styles.rightButton}>
            <Button
              variant="primary"
              className={styles.createButton}
              onClick={handleCreateProject}
            >
              Crear Proyecto
            </Button>
          </div>
        </div>
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <Table striped bordered hover className={styles.projectTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Proyecto</th>
                <th>Alias del Cliente</th>
                <th>Estado</th>
                <th>Piezas</th>
                {role === "ADMIN" && <th>Contacto</th>}
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className={styles.clickableRow}
                >
                  <td>{project.id}</td>
                  <td>{project.projectName}</td>
                  <td>{project.clientAlias}</td>
                  <td>{project.state ? "Finalizado" : "En proceso"}</td>
                  <td>{project.parts ? project.parts.length : 0}</td>
                  {role === "ADMIN" && <td>{project.contact}</td>}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
      <BackButton />
    </>
  );
};

export default ProjectList;
