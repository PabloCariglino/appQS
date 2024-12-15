import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoleFromToken, login, setAuthToken } from "./AuthService";
import useAuthContext from "./useAuthContext"; // Corrigiendo el nombre del hook

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setIsLoggedIn, setRole } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Intentando iniciar sesión con email:", email);

    try {
      const response = await login(email, password);
      console.log("Respuesta del servidor:", response);

      if (response && response.data) {
        const jwt = response.data.jwt; // Obtener el JWT de la respuesta
        console.log("JWT recibido:", jwt);

        if (jwt) {
          try {
            setAuthToken(jwt); // Guardar el token usando sessionStorage
          } catch (storageError) {
            console.error("Error al acceder a sessionStorage:", storageError);
            setError(
              "No se pudo almacenar la sesión. Revise los permisos del navegador."
            );
            return;
          }

          const role = getRoleFromToken();
          console.log("Rol recibido:", role);

          if (role === "ADMIN") {
            setIsLoggedIn(true);
            setRole(role);
            navigate("/admin");
          } else if (role === "OPERATOR") {
            setIsLoggedIn(true);
            setRole(role);
            navigate("/operator");
          } else {
            setError("Rol no válido. No tiene permisos para acceder.");
            console.error("Rol no válido recibido:", role);
          }
        } else {
          setError("Error al obtener el token del servidor.");
          console.error(
            "No se recibió ningún token en la respuesta del servidor."
          );
        }
      } else {
        setError("Error al obtener datos del servidor.");
        console.error(
          "Error: No se recibió ningún dato en la respuesta del servidor."
        );
      }
    } catch (error) {
      console.error(
        "Error al realizar la solicitud de inicio de sesión:",
        error
      );
      setError("Error al obtener datos del servidor.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Iniciar Sesión</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group mt-3">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary mt-4">
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
