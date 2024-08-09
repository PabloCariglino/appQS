import axios from "axios";
import PropTypes from "prop-types";
import React from "react";
import { Navigate, Route } from "react-router-dom";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = localStorage.getItem("token");

  // Configura el token en las cabeceras de las solicitudes de Axios
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        token ? <Component {...props} /> : <Navigate to="/login" />
      }
    />
  );
};

// Definir PropTypes para la validación de las props
PrivateRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
};

export default PrivateRoute;
