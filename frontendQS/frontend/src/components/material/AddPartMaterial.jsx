import axios from "axios";
import { useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../../fragments/BackButton";

const AddPartMaterial = () => {
  const [materialName, setMaterialName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getAccessToken(); // Obtén el token de autenticación
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/part-materials",
        { materialName },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Agregar el token en los headers
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setError("");
        setMaterialName("");
        navigate("/project-list"); // Redirige a la lista de proyectos

        // Ocultar mensaje de éxito después de unos segundos
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError(
          "Error al agregar el material. Por favor, inténtelo de nuevo."
        );
      }
      console.error(err);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Agregar Nuevo Material</h2>
      {success && (
        <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
          Material agregado exitosamente.
        </Alert>
      )}
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="materialName">
          <Form.Label>Nombre del Material</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingrese el nombre del material"
            value={materialName}
            onChange={(e) => setMaterialName(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Agregar Material
        </Button>
      </Form>
      <BackButton />
    </Container>
  );
};

export default AddPartMaterial;
