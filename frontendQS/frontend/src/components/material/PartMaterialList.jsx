import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, Button, Container, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../../fragments/BackButton";

const PartMaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch materiales al cargar el componente
  useEffect(() => {
    const fetchMaterials = async () => {
      const token = getAccessToken();

      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8080/api/part-materials",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMaterials(response.data);
      } catch (err) {
        console.error("Error al obtener los materiales:", err);
        setError("Error al cargar los materiales. Inténtalo de nuevo.");
      }
    };

    fetchMaterials();
  }, []);

  // Manejar eliminación de material
  const handleDeleteMaterial = async (id) => {
    const token = getAccessToken();

    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/part-materials/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Eliminar el material de la lista localmente
      setMaterials((prevMaterials) =>
        prevMaterials.filter((material) => material.id !== id)
      );
    } catch (err) {
      console.error("Error al eliminar el material:", err);
      setError("Error al eliminar el material. Inténtalo de nuevo.");
    }
  };

  // Manejar redirección para agregar material
  const handleAddMaterialClick = () => {
    navigate("/add-part-material");
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Lista de Materiales</h2>
        <Button onClick={handleAddMaterialClick} variant="primary">
          Agregar Material
        </Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      {materials.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre del Material</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, index) => (
              <tr key={material.id}>
                <td>{index + 1}</td>
                <td>{material.materialName}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">No hay materiales registrados.</Alert>
      )}
      <BackButton />
    </Container>
  );
};

export default PartMaterialList;
