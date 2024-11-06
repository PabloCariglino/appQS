// PrivateRoute.jsx
import PropTypes from "prop-types"; // Importamos PropTypes
import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./AuthContext";

// Definimos el componente de ruta privada
const PrivateRoute = ({ allowedRoles }) => {
  const { role, isLoggedIn } = useContext(AuthContext);

  // Si no está logueado, redirige al login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol no está permitido, redirige a una página no autorizada
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si pasa todas las validaciones, renderiza la ruta solicitada
  return <Outlet />;
};

// Definimos las prop-types para validar las props
PrivateRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired, // allowedRoles debe ser un array de strings y obligatorio
};

export default PrivateRoute;
