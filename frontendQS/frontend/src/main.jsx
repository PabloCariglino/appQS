import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
// import { AuthProvider } from "./AuthContext"; // Importa el AuthProvider
import { AuthProvider } from "./auth/AuthContext";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
