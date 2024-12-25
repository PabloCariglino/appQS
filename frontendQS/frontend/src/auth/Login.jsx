import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoleFromToken, login } from "./AuthService";
import useAuthContext from "./useAuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setIsLoggedIn, setRole } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await login(email, password);
      if (success) {
        const role = getRoleFromToken();
        console.log("Rol obtenido desde el token:", role);

        if (role) {
          setIsLoggedIn(true);
          setRole(role);

          if (role === "ADMIN") {
            navigate("/admin");
          } else if (role === "OPERATOR") {
            navigate("/operator");
          } else {
            setError("Rol no autorizado.");
          }
        } else {
          setError("No se pudo determinar el rol del usuario.");
        }
      } else {
        setError("Error al iniciar sesión.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Credenciales incorrectas o error del servidor.");
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
