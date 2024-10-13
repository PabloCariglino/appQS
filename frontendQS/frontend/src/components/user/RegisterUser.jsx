import React, { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import UserService from "../../services/UserService";
import styles from "./RegisterUser.module.css"; // Importamos el CSS module

// Enum de roles como constante
const ROLES = {
  ADMIN: "ADMIN",
  OPERATOR: "OPERATOR",
};

const RegisterUserForm = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    rol: ROLES.OPERATOR, // Valor por defecto OPERATOR
  });
  const [error, setError] = useState(null); // Estado para manejar errores
  const [successMessage, setSuccessMessage] = useState(null); // Mensaje de éxito

  // Maneja el cambio de los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null); // Resetea el error en cada cambio
    setSuccessMessage(null); // Resetea el mensaje de éxito
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const savedUser = await UserService.registerUser(formData);
      setSuccessMessage(`Usuario registrado: ${savedUser.userName}`);
      setFormData({
        userName: "",
        email: "",
        password: "",
        rol: ROLES.OPERATOR,
      }); // Resetea el formulario
    } catch (error) {
      setError(error); // Maneja el error
      console.error("Error registrando el usuario:", error);
    }
  };

  return (
    <Container className={styles.formContainer}>
      <Form onSubmit={handleSubmit} className={styles.form}>
        <h2 className="text-center mb-4">Registro de Usuario</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            Error registrando el usuario: {error.message}
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        <Form.Group controlId="formUserName">
          <Form.Label>Nombre de Usuario</Form.Label>
          <Form.Control
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formPassword">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formRol">
          <Form.Label>Rol</Form.Label>
          <Form.Control
            as="select"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
          >
            <option value={ROLES.ADMIN}>Administrador</option>
            <option value={ROLES.OPERATOR}>Operador</option>
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit" className={styles.submitButton}>
          Registrar Usuario
        </Button>
      </Form>
    </Container>
  );
};

export default RegisterUserForm;
