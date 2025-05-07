import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import useAuthContext from "../../auth/UseAuthContext";
import CustomPartService from "../../services/CustomPartService";

const AddCustomPart = () => {
  const [customPartName, setCustomPartName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { role } = useAuthContext();

  const basePath = role === "ADMIN" ? "/admin" : "/operator";

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customPartName.trim()) {
      setError("El nombre de la pieza es obligatorio.");
      return;
    }

    try {
      await CustomPartService.createCustomPart(customPartName, imageFile);
      setSuccess(true);
      setError("");
      setCustomPartName("");
      setImageFile(null);
      navigate(`${basePath}/partCustom-list`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al agregar la pieza personalizada. Inténtelo nuevamente."
      );
      console.error("Frontend Error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 md:px-10 py-10">
        <div>
          <h2 className="text-center text-2xl md:text-3xl font-bold text-red-600 mb-2 ">
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
              className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full"
            >
              <div className="mb-4">
                <label className="block text-gray-800 font-medium mb-2">
                  Nombre de la Pieza
                </label>
                <input
                  type="text"
                  placeholder="Ingrese el nombre de la pieza"
                  value={customPartName}
                  onChange={(e) => setCustomPartName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-800 font-medium mb-2">
                  Subir Imagen (Opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Si no seleccionas una imagen, la pieza se guardará sin imagen.
                </p>
              </div>

              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm md:text-base sm:px-3 md:px-4"
              >
                <FaPlus className="text-sm sm:text-base" />
                Agregar Pieza Personalizada
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomPart;
