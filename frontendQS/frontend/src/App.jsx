import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import OperatorDashboard from "./../src/pages/operatorDashboard/page/OperatorDashboard";
import { getRoleFromToken, isAuthenticated } from "./auth/AuthService";
import useAuthContext from "./auth/UseAuthContext";
import AddPartMaterial from "./components/material/AddPartMaterial";
import PartMaterialList from "./components/material/PartMaterialList";
import AddCustomPart from "./components/partCustom/AddCustomPart";
import CustomPartList from "./components/partCustom/CustomPartList";
import CreateProject from "./components/project/CreateProject";
import ProjectDetail from "./components/project/ProjectDetail";
import ProjectList from "./components/project/ProjectList";
import PartScanner from "./components/Scanner/PartScanner";
import Tasks from "./components/task/Tasks";
import RegisterUser from "./components/user/RegisterUser";
import UserList from "./components/user/UserList";
import AdminDashboard from "./pages/adminDashboard/page/AdminDashboard";
import Home from "./pages/home/pages/Home";
import Login from "./pages/home/pages/Login";

const App = () => {
  const { isLoggedIn, role, setRole, setIsLoggedIn } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tokenValid = isAuthenticated();
    const userRole = getRoleFromToken();

    if (tokenValid) {
      setIsLoggedIn(true);
      setRole(userRole);
      // Guardar tiempo de login si no existe
      if (!sessionStorage.getItem("loginTime")) {
        sessionStorage.setItem("loginTime", Date.now());
      }
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }

    setIsLoading(false); // Marcar como cargado
  }, [setIsLoggedIn, setRole]);

  // Deslogeo automatico
  useEffect(() => {
    const checkTokenExpiration = () => {
      const loginTime = sessionStorage.getItem("loginTime");
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        console.log("Tiempo transcurrido:", elapsed); // Para depurar
        if (elapsed >= 8 * 60 * 60 * 1000) {
          console.log("Expiró, redirigiendo..."); // Para depurar
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("loginTime");
          setIsLoggedIn(false);
          setRole(null);
          navigate("/login");
        }
      }
    };

    const interval = setInterval(checkTokenExpiration, 55000); // Revisa cada 55 segundos
    return () => clearInterval(interval);
  }, [navigate, setIsLoggedIn, setRole]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  const redirectIfNeeded = () => {
    if (isLoggedIn && role === "ADMIN" && location.pathname === "/") {
      return <Navigate to="/admin" />;
    }
    if (isLoggedIn && role === "OPERATOR" && location.pathname === "/") {
      return <Navigate to="/operator" />;
    }
    return null;
  };

  return (
    <div>
      {redirectIfNeeded()}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            isLoggedIn && role === "ADMIN" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/register-user"
          element={
            isLoggedIn && role === "ADMIN" ? (
              <RegisterUser />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/user-list"
          element={
            isLoggedIn && role === "ADMIN" ? <UserList /> : <Navigate to="/" />
          }
        />
        <Route
          path="/material-list"
          element={
            isLoggedIn && role === "ADMIN" ? (
              <PartMaterialList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/add-part-material"
          element={
            isLoggedIn && role === "ADMIN" ? (
              <AddPartMaterial />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/add-custom-part"
          element={
            isLoggedIn && role === "ADMIN" ? (
              <AddCustomPart />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/PartCustom-list"
          element={
            isLoggedIn && role === "ADMIN" ? (
              <CustomPartList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/project-list"
          element={
            isLoggedIn && (role === "ADMIN" || role === "OPERATOR") ? (
              <ProjectList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/create-project"
          element={
            isLoggedIn && role === "ADMIN" ? (
              <CreateProject />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/projects/:id"
          element={
            isLoggedIn && (role === "ADMIN" || role === "OPERATOR") ? (
              <ProjectDetail />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/operator"
          element={
            isLoggedIn && role === "OPERATOR" ? (
              <OperatorDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/part-scanner"
          element={
            isLoggedIn && (role === "ADMIN" || role === "OPERATOR") ? (
              <PartScanner />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/tasks"
          element={
            isLoggedIn && (role === "ADMIN" || role === "OPERATOR") ? (
              <Tasks />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
