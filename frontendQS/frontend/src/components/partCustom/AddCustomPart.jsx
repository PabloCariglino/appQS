import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../BackButton";
import FooterDashboard from "./../FooterDashboard";
import NavbarDashboard from "./../NavbarDashboard";

const AddCustomPart = () => {
  const [customPart, setCustomPart] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("customPart", customPart);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const token = getAccessToken();
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/customParts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 201) {
        setSuccess(true);
        setError("");
        setCustomPart("");
        setImageFile(null);
        navigate("/project-list");
      }
    } catch (err) {
      setError(
        "Error al agregar la pieza personalizada. Inténtelo nuevamente."
      );
      console.error("Frontend Error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarDashboard />
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-grill mb-6">
          Agregar Nueva Pieza Personalizada
        </h2>
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 text-center max-w-md mx-auto">
            Pieza personalizada agregada exitosamente.
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
                Nombre de la Pieza
              </label>
              <input
                type="text"
                placeholder="Ingrese el nombre de la pieza"
                value={customPart}
                onChange={(e) => setCustomPart(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-dashboard-text font-medium mb-2">
                Subir Imagen (Opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
              />
              <p className="text-gray-500 text-sm mt-1">
                Si no seleccionas una imagen, la pieza se guardará sin imagen.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Agregar Pieza Personalizada
            </button>
          </form>
        </div>

        {/* Botón Volver centrado */}
        <div className="mt-6 flex justify-center">
          <BackButton />
        </div>
      </div>
      <FooterDashboard />
    </div>
  );
};

export default AddCustomPart;
