import React, { useContext, useEffect, useState } from "react";
import { Button, Container, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import ProjectService from "../../services/ProjectService";
import styles from "./ProjectList.module.css";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await ProjectService.fetchProjects(); // Llama al servicio para obtener proyectos
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectClick = (id) => {
    navigate(`/projects/${id}`);
  };

  const handleCreateProject = async () => {
    const newProject = {
      projectName: "Nuevo Proyecto",
      clientAlias: "Cliente XYZ",
      contact: 1234567890,
      state: false,
    };

    try {
      const createdProject = await ProjectService.createProject(newProject);
      setProjects((prevProjects) => [...prevProjects, createdProject]);
      navigate(`/projects/${createdProject.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <Container className={styles.tableContainer}>
      <div className={styles.createProjectButtonContainer}>
        <Button
          variant="primary"
          className={styles.createButton}
          onClick={handleCreateProject}
        >
          Crear Proyecto
        </Button>
      </div>

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
            <tr key={project.id} onClick={() => handleProjectClick(project.id)}>
              <td>{project.id}</td>
              <td>{project.projectName}</td>
              <td>{project.clientAlias}</td>
              <td>{project.state ? "Finalizado" : "En proceso"}</td>
              <td>{project.parts.length}</td>
              {role === "ADMIN" && <td>{project.contact}</td>}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ProjectList;
