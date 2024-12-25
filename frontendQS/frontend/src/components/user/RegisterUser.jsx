import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../../fragments/BackButton";

const RegisterUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    role: "OPERATOR",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Estado para el mensaje de éxito

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAccessToken();

    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/user-dashboard/register-user",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMessage("¡Usuario registrado exitosamente!"); // Mostrar el mensaje de éxito
      setTimeout(() => {
        navigate("/user-list"); // Redirigir después de 2 segundos
      }, 3000);
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setError(
        error.response?.data ||
          "No se pudo registrar el usuario. Verifica los datos."
      );
    }
  };

  return (
    <>
      <div className="container mt-5">
        <h2>Registrar Usuario</h2>
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mt-3">
            <label>Nombre de Usuario</label>
            <input
              type="text"
              name="userName"
              className="form-control"
              value={formData.userName || ""}
              onChange={handleChange}
              required
            />
          </div>

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
            <label>Contraseña</label>
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
      <BackButton />
    </>
  );
};

export default RegisterUser;
