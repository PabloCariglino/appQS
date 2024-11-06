import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterUser = () => {
  const { getAccessTokenSilently } = useAuth0(); // Auth0 hook para obtener el token de acceso
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "OPERATOR", // Valor predeterminado, pero se puede seleccionar otro
  });

  const [error, setError] = useState("");

  // Maneja el cambio en los inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Enviar datos del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getAccessTokenSilently(); // Obtener token de acceso

      // Llamada al backend para registrar al usuario
      await axios.post(
        "http://localhost:8080/api/user-dashboard/register-user",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pasar el token al backend
          },
        }
      );

      navigate("/admin-dashboard"); // Redirige al dashboard después del registro
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setError("No se pudo registrar el usuario. Verifica los datos.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Registrar Usuario</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group mt-3">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group mt-3">
          <label>Rol</label>
          <select
            name="role"
            className="form-control"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="OPERATOR">Operator</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary mt-4">
          Registrar
        </button>
      </form>
    </div>
  );
};

export default RegisterUser;
