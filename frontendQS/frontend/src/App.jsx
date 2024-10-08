import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import UserDashboard from "./components/UserDashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <UserDashboard />
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
