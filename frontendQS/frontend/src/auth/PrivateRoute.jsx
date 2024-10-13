import axios from "axios";
import PropTypes from "prop-types";
import { Navigate, Outlet } from "react-router-dom";
import { getRoleFromToken } from "./authService"; // Importación corregida

const PrivateRoute = ({ roles }) => {
  const token = localStorage.getItem("token");
  const userRole = getRoleFromToken();

  // Configurar el token en los encabezados de axios si existe
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  // Comprobar si el usuario tiene acceso a la ruta
  if (token && roles.includes(userRole)) {
    return <Outlet />; // Renderiza los hijos si el acceso es permitido
  } else {
    return <Navigate to="/login" replace />; // Redirige si no tiene acceso
  }
};

// Validación de las props
PrivateRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default PrivateRoute;
