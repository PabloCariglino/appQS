import axios from "axios";
import React, { useEffect, useState } from "react";
import { Container, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import styles from "./PartList.module.css";

const PartList = () => {
  const { projectId } = useParams(); // Obtén el ID del proyecto desde la URL
  const [parts, setParts] = useState([]);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/projects/${projectId}/parts`
        );
        setParts(response.data);
      } catch (error) {
        console.error("Error fetching parts:", error);
      }
    };
    fetchParts();
  }, [projectId]);

  return (
    <Container className={styles.tableContainer}>
      <h2>Piezas del Proyecto {projectId}</h2>
      <Table striped bordered hover className={styles.partTable}>
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
              <td>{part.name}</td>
              <td>{part.receptionState ? "Recibido" : "Pendiente"}</td>
              <td>{part.qualityControlState ? "Aprobado" : "Rechazado"}</td>
              <td>{part.observations}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default PartList;
