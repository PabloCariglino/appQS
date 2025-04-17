import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import useAuthContext from "../../auth/UseAuthContext";

const AddPartMaterial = () => {
  const [materialName, setMaterialName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { role } = useAuthContext();

  const basePath = role === "ADMIN" ? "/admin" : "/operator";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getAccessToken();
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/part-materials",
        { materialName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setError("");
        setMaterialName("");
        navigate(`${basePath}/project-list`);

        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError(
          "Error al agregar el material. Por favor, inténtelo de nuevo."
        );
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-grill mb-6">
          Agregar Nuevo Material
        </h2>
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 text-center max-w-md mx-auto">
            Material agregado exitosamente.
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
                Nombre del Material
              </label>
              <input
                type="text"
                placeholder="Ingrese el nombre del material"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Agregar Material
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPartMaterial;
