import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import RegisterUser from "./components/user/RegisterUser";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import OperatorDashboard from "./pages/OperatorDashboard";

function App() {
  const {
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
    getAccessTokenSilently,
  } = useAuth0();
  const [role, setRole] = useState(null); // Estado para el rol

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const token = await getAccessTokenSilently();
          const response = await axios.get(
            `/api/users/role?email=${user.email}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setRole(response.data); // Guardamos el rol recibido
        } catch (error) {
          console.error("Error obteniendo el rol del usuario:", error);
        }
      }
    };

    fetchUserRole();
  }, [user, getAccessTokenSilently]);

  if (!isAuthenticated) {
    return <button onClick={() => loginWithRedirect()}>Iniciar Sesión</button>;
  }

  const handleLogout = () => logout({ returnTo: window.location.origin });

  return (
    <Router>
      <button onClick={handleLogout}>Cerrar Sesión</button>
      <Routes>
        <Route path="/" element={<Home />} />
        {role === "ADMIN" && (
          <Route path="/admin" element={<AdminDashboard />} />
        )}
        {role === "OPERATOR" && (
          <Route path="/operator" element={<OperatorDashboard />} />
        )}
        <Route
          path="/register-user"
          element={role === "ADMIN" ? <RegisterUser /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
