import { useContext, useEffect, useState } from "react";
import { Button, Container, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../../fragments/BackButton";
import ProjectService from "../../services/ProjectService";
import styles from "./ProjectList.module.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState(null);
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = getAccessToken();

      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      try {
        console.log("Solicitando lista de proyectos...");
        const response = await ProjectService.fetchProjects({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.success) {
          console.log("Lista de proyectos recibida:", response.data);
          setProjects(response.data);
          setFilteredProjects(response.data); // Inicializa el filtro
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "") {
      setFilteredProjects(projects); // Reset the filter when search is cleared
    } else {
      setFilteredProjects(
        projects.filter((project) =>
          Object.values(project).some((val) =>
            String(val).toLowerCase().includes(value.toLowerCase())
          )
        )
      );
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }

    const sortedProjects = [...filteredProjects].sort((a, b) => {
      if (
        key === "createdDate" ||
        key === "visitDateTime" ||
        key === "installationDateTime"
      ) {
        return direction === "ascending"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }

      if (typeof a[key] === "number") {
        return direction === "ascending" ? a[key] - b[key] : b[key] - a[key];
      }

      return direction === "ascending"
        ? a[key].localeCompare(b[key])
        : b[key].localeCompare(a[key]);
    });

    setFilteredProjects(sortedProjects);
    setSortConfig({ key, direction });
  };

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

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>

        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <Table striped bordered hover className={styles.projectTable}>
            <thead>
              <tr>
                <th onClick={() => handleSort("createdDate")}>
                  Fecha de Creación
                </th>
                <th onClick={() => handleSort("id")}>ID</th>
                <th onClick={() => handleSort("clientAlias")}>
                  Nombre del Cliente
                </th>
                <th onClick={() => handleSort("contact")}>Contacto</th>
                <th onClick={() => handleSort("visitDateTime")}>
                  Fecha de Visita
                </th>
                <th onClick={() => handleSort("installationDateTime")}>
                  Fecha de Instalación
                </th>
                <th onClick={() => handleSort("pieces")}>Piezas</th>
                <th onClick={() => handleSort("state")}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className={styles.clickableRow}
                >
                  <td>{new Date(project.createdDate).toLocaleString()}</td>
                  <td>{project.id}</td>
                  <td>{project.clientAlias}</td>
                  <td>{project.contact}</td>
                  <td>{new Date(project.visitDateTime).toLocaleString()}</td>
                  <td>
                    {new Date(project.installationDateTime).toLocaleString()}
                  </td>
                  <td>{project.parts ? project.parts.length : 0}</td>
                  <td>{project.state ? "En proceso" : "Finalizado"}</td>
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
