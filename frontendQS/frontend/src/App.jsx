import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getRoleFromToken, isAuthenticated } from "./auth/AuthService";
import Login from "./auth/Login";
import useAuthContext from "./auth/useAuthContext";
import AddPartMaterial from "./components/material/AddPartMaterial";
import AddCustomPart from "./components/part/AddCustomPart";
import CreateProject from "./components/project/CreateProject";
import ProjectList from "./components/project/ProjectList";
import RegisterUser from "./components/user/RegisterUser";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import OperatorDashboard from "./pages/OperatorDashboard";

const App = () => {
  const { isLoggedIn, role, setRole, setIsLoggedIn } = useAuthContext();

  // Actualizar el estado de autenticación y rol al cargar la app
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setRole(getRoleFromToken());
  }, [setIsLoggedIn, setRole]);

  return (
    <div>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas para ADMIN */}
        {isLoggedIn && role === "ADMIN" && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/register-user" element={<RegisterUser />} />
            <Route path="/project-list" element={<ProjectList />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/add-part-material" element={<AddPartMaterial />} />
            <Route path="/add-custom-part" element={<AddCustomPart />} />
          </>
        )}

        {/* Rutas protegidas para OPERATOR */}
        {isLoggedIn && role === "OPERATOR" && (
          <>
            <Route path="/operator" element={<OperatorDashboard />} />
            <Route path="/project-list" element={<ProjectList />} />
          </>
        )}

        {/* Redirigir rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
