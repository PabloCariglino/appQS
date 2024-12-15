import axios from "axios";
import { useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";

const AddPartMaterial = () => {
  const [materialName, setMaterialName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/partMaterials",
        {
          materialName,
        }
      );
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setError("");
        setMaterialName("");
      }
    } catch (err) {
      setError("Error al agregar el material. Por favor, inténtelo de nuevo.");
      console.error(err);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Agregar Nuevo Material</h2>
      {success && (
        <Alert variant="success">Material agregado exitosamente.</Alert>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
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
    </Container>
  );
};

export default AddPartMaterial;
