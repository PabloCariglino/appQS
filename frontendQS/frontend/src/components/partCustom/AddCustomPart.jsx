import axios from "axios";
import { useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../../fragments/BackButton";

const AddCustomPart = () => {
  const [customPart, setCustomPart] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Manejar el formulario completo
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("customPart", customPart);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const token = getAccessToken();
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/customParts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 201) {
        setSuccess(true);
        setError("");
        setCustomPart("");
        setImageFile(null);
        navigate("/project-list");
      }
    } catch (err) {
      setError(
        "Error al agregar la pieza personalizada. Inténtelo nuevamente."
      );
      console.error("Frontend Error:", err.response?.data || err.message);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Agregar Nueva Pieza Personalizada</h2>
      {success && (
        <Alert variant="success">
          Pieza personalizada agregada exitosamente.
        </Alert>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="customPart">
          <Form.Label>Nombre de la Pieza</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingrese el nombre de la pieza"
            value={customPart}
            onChange={(e) => setCustomPart(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="imageFile" className="mt-3">
          <Form.Label>Subir Imagen (Opcional)</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <Form.Text className="text-muted">
            Si no seleccionas una imagen, la pieza se guardará sin imagen.
          </Form.Text>
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Agregar Pieza Personalizada
        </Button>
      </Form>
      <BackButton />
    </Container>
  );
};

export default AddCustomPart;
