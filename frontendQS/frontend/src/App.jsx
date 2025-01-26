import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { getRoleFromToken, isAuthenticated } from "./auth/AuthService";
import Login from "./auth/Login";
import useAuthContext from "./auth/useAuthContext";
import AddPartMaterial from "./components/material/AddPartMaterial";
import AddCustomPart from "./components/partCustom/AddCustomPart";
import CreateProject from "./components/project/CreateProject";
import ProjectList from "./components/project/ProjectList";
import RegisterUser from "./components/user/RegisterUser";
import UserList from "./components/user/UserList";
import Footer from "./fragments/Footer";
import Navbar from "./fragments/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import OperatorDashboard from "./pages/OperatorDashboard";

import PartMaterialList from "./components/material/PartMaterialList";
import CustomPartList from "./components/partCustom/CustomPartList";
import ProjectDetail from "./components/project/ProjectDetail";

const App = () => {
  const { isLoggedIn, role, setRole, setIsLoggedIn } = useAuthContext();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tokenValid = isAuthenticated();
    const userRole = getRoleFromToken();

    if (tokenValid) {
      setIsLoggedIn(true);
      setRole(userRole);
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }

    setIsLoading(false); // Marcar como cargado
  }, [setIsLoggedIn, setRole]);

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
      <Navbar />
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
          path="/project-detail"
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
