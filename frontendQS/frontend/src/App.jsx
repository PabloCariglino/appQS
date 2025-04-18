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
import Calendar from "./components/calendar/Calendar";
import AddPartMaterial from "./components/material/AddPartMaterial";
import PartMaterialList from "./components/material/PartMaterialList";
import AddCustomPart from "./components/partCustom/AddCustomPart";
import CustomPartList from "./components/partCustom/CustomPartList";
import CreateProject from "./components/project/CreateProject";
import ProjectDetail from "./components/project/ProjectDetail";
import ProjectList from "./components/project/ProjectList";
import PartScanner from "./components/Scanner/PartScanner";
import OperatorTasks from "./components/task/OperatorTasks";
import PartsByState from "./components/task/PartsByState";
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
      if (!sessionStorage.getItem("loginTime")) {
        sessionStorage.setItem("loginTime", Date.now());
      }
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }

    setIsLoading(false);
  }, [setIsLoggedIn, setRole]);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const loginTime = sessionStorage.getItem("loginTime");
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        console.log("Tiempo transcurrido:", elapsed);
        if (elapsed >= 8 * 60 * 60 * 1000) {
          console.log("Expiró, redirigiendo...");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("loginTime");
          setIsLoggedIn(false);
          setRole(null);
          navigate("/login");
        }
      }
    };

    const interval = setInterval(checkTokenExpiration, 55000);
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
        >
          <Route index element={<Calendar />} />{" "}
          {/* Vista inicial para /admin */}
          <Route path="project-list" element={<ProjectList />} />
          <Route path="create-project" element={<CreateProject />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="add-custom-part" element={<AddCustomPart />} />
          <Route path="PartCustom-list" element={<CustomPartList />} />
          <Route path="material-list" element={<PartMaterialList />} />
          <Route path="add-part-material" element={<AddPartMaterial />} />
          <Route path="register-user" element={<RegisterUser />} />
          <Route path="user-list" element={<UserList />} />
          <Route path="part-scanner" element={<PartScanner />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="parts/state/:state" element={<PartsByState />} />
          <Route path="operator-tasks" element={<OperatorTasks />} />
        </Route>
        <Route
          path="/operator"
          element={
            isLoggedIn && role === "OPERATOR" ? (
              <OperatorDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        >
          <Route index element={<Tasks />} />{" "}
          {/* Vista inicial para /operator */}
          <Route path="project-list" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="part-scanner" element={<PartScanner />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="parts/state/:state" element={<PartsByState />} />
          <Route path="operator-tasks" element={<OperatorTasks />} />
        </Route>
        <Route
          path="/contact"
          element={!isLoggedIn ? <Home /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
