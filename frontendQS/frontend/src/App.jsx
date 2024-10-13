import "bootstrap/dist/css/bootstrap.min.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";
import Home from "./components/Home";
import CreateProject from "./components/project/CreateProject";
import ProjectList from "./components/project/ProjectList";
import RegisterUserForm from "./components/user/RegisterUser";
import Footer from "./fragments/Footer";
import Navbar from "./fragments/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute roles={["OPERATOR"]} />}>
            <Route path="/operator-dashboard" element={<OperatorDashboard />} />
          </Route>
          <Route element={<PrivateRoute roles={["ADMIN"]} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/register-user" element={<RegisterUserForm />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/project-list" element={<ProjectList />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
