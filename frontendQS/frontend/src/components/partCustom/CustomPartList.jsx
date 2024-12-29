import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, Button, Container, Form, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../../fragments/BackButton";

const CustomPartList = () => {
  const [customParts, setCustomParts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingPart, setEditingPart] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedImage, setUpdatedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomParts = async () => {
      const token = getAccessToken();

      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8080/api/customParts/custom-part-list",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCustomParts(response.data);
      } catch (err) {
        setError(
          "Error al obtener las piezas personalizadas. Intenta de nuevo."
        );
        console.error("Error al obtener las piezas:", err);
      }
    };

    fetchCustomParts();
  }, []);

  const handleDeleteCustomPart = async (id) => {
    try {
      const token = getAccessToken();
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      await axios.delete(`http://localhost:8080/api/customParts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCustomParts((prevParts) => prevParts.filter((part) => part.id !== id));
      setSuccess("Pieza eliminada exitosamente.");
    } catch (err) {
      setError("Error al eliminar la pieza personalizada. Intenta de nuevo.");
      console.error("Error al eliminar la pieza:", err);
    }
  };

  const handleUpdateCustomPart = async (id) => {
    const formData = new FormData();

    if (updatedName) formData.append("customPart", updatedName);
    if (updatedImage) formData.append("image", updatedImage);

    if (!updatedName && !updatedImage) {
      setError("No hay cambios para actualizar.");
      return;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/api/customParts/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setCustomParts((prevParts) =>
        prevParts.map((part) =>
          part.id === id ? { ...part, ...response.data } : part
        )
      );

      setSuccess("Pieza actualizada exitosamente.");
      setEditingPart(null);
      setUpdatedName("");
      setUpdatedImage(null);
    } catch (err) {
      setError("Error al actualizar la pieza personalizada. Intenta de nuevo.");
      console.error("Error al actualizar la pieza:", err);
    }
  };

  const handleAddCustomPartClick = () => {
    navigate("/add-custom-part");
  };

  return (
    <Container className="mt-5">
      <h2>Lista de Piezas Personalizadas</h2>
      <Button onClick={handleAddCustomPartClick} variant="primary">
        Agregar Pieza Personalizada
      </Button>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {customParts.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Imagen</th>
              <th>Acciones</th>
              <th>Actualizar</th>
            </tr>
          </thead>
          <tbody>
            {customParts.map((part) => (
              <tr key={part.id}>
                <td>{part.id}</td>
                <td>
                  {editingPart === part.id ? (
                    <Form.Control
                      type="text"
                      defaultValue={part.customPart}
                      onChange={(e) => setUpdatedName(e.target.value)}
                    />
                  ) : (
                    part.customPart
                  )}
                </td>
                <td>
                  {part.imageFilePath ? (
                    <img
                      src={`http://localhost:8080/uploads/custom-parts/${part.imageFilePath}`}
                      alt={part.customPart}
                      style={{ width: "100px", height: "auto" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = ""; // Ruta alternativa o texto de error
                      }}
                    />
                  ) : (
                    "Sin imagen"
                  )}
                  {editingPart === part.id && (
                    <Form.Group>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => setUpdatedImage(e.target.files[0])}
                      />
                    </Form.Group>
                  )}
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteCustomPart(part.id)}
                  >
                    Eliminar
                  </Button>
                </td>
                <td>
                  {editingPart === part.id ? (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleUpdateCustomPart(part.id)}
                    >
                      Guardar
                    </Button>
                  ) : (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => setEditingPart(part.id)}
                    >
                      Editar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">No hay piezas personalizadas registradas.</Alert>
      )}
      <BackButton />
    </Container>
  );
};

export default CustomPartList;
