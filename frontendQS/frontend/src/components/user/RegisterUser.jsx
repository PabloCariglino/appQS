import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import useAuthContext from "../../auth/UseAuthContext"; // Añadimos esta importación para obtener el rol

const RegisterUser = () => {
  const navigate = useNavigate();
  const { role } = useAuthContext(); // Obtener el rol del usuario
  const basePath = role === "ADMIN" ? "/admin" : "/operator"; // Definir basePath
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    role: "OPERATOR",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAccessToken();

    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/user-dashboard/register-user",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMessage("¡Usuario registrado exitosamente!");
      setTimeout(() => {
        navigate(`${basePath}/user-list`);
      }, 3000);
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setError(
        error.response?.data ||
          "No se pudo registrar el usuario. Verifica los datos."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-grill mb-6">
          Registrar Usuario
        </h2>
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 text-center max-w-md mx-auto">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center max-w-md mx-auto">
            {error}
          </div>
        )}
        <div className="flex justify-center items-center">
          <form
            onSubmit={handleSubmit}
            className="bg-dashboard-background p-8 rounded-lg shadow-md max-w-md w-full"
          >
            <div className="mb-4">
              <label className="block text-dashboard-text font-medium mb-2">
                Nombre de Usuario
              </label>
              <input
                type="text"
                name="userName"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                value={formData.userName || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-dashboard-text font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-dashboard-text font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-dashboard-text font-medium mb-2">
                Rol
              </label>
              <select
                name="role"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="OPERATOR">Operator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 mt-4"
            >
              Registrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
