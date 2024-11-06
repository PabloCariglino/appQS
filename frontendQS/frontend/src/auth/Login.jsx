// Login.jsx
import axios from "axios";
import React, { useState } from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", response.data.jwt);

      const role = response.data.role;
      if (role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (role === "OPERATOR") {
        navigate("/operator-dashboard");
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <Container className={styles.formContainer}>
      <Form onSubmit={handleSubmit} className={styles.form}>
        <h2 className="text-center mb-4">Iniciar Sesión</h2>

        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
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
