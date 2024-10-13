import axios from "axios";
import React, { useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Hook para manejar la navegación
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Sustituye history por navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.jwt); // Asegúrate que el token se llama `jwt`

      // Redirige al dashboard adecuado según el rol del usuario
      if (response.data.role === "ADMIN") {
        navigate("/admin-dashboard"); // Utiliza navigate en lugar de history.push
      } else {
        navigate("/operator-dashboard");
      }
    } catch (err) {
      setError("Invalid email or password"); // Cambiado para mayor claridad
    }
  };

  return (
    <Container className={styles.formContainer}>
      <Form onSubmit={handleSubmit} className={styles.form}>
        <h2 className="text-center mb-4">Iniciar Sesión</h2>

        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email" // Cambiado a email
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formPassword">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        {error && <Alert variant="danger">{error}</Alert>}

        <Button variant="primary" type="submit" className={styles.submitButton}>
          Iniciar Sesión
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
