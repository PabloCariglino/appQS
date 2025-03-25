import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../BackButton";
import FooterDashboard from "./../FooterDashboard";
import NavbarDashboard from "./../NavbarDashboard";

const CustomPartList = () => {
  const [customParts, setCustomParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingPart, setEditingPart] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedImage, setUpdatedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomParts = async () => {
      const token = getAccessToken();

      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8080/api/customParts/custom-part-list",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCustomParts(response.data);
        setFilteredParts(response.data); // Inicializa el filtro
      } catch (err) {
        setError(
          "Error al obtener las piezas personalizadas. Intenta de nuevo."
        );
        console.error("Error al obtener las piezas:", err);
      }
    };

    fetchCustomParts();
  }, []);

  const handleDeleteCustomPart = async (id) => {
    try {
      const token = getAccessToken();
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      await axios.delete(`http://localhost:8080/api/customParts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCustomParts((prevParts) => prevParts.filter((part) => part.id !== id));
      setFilteredParts((prevParts) =>
        prevParts.filter((part) => part.id !== id)
      );
      setSuccess("Pieza eliminada exitosamente.");
    } catch (err) {
      setError("Error al eliminar la pieza personalizada. Intenta de nuevo.");
      console.error("Error al eliminar la pieza:", err);
    }
  };

  const handleUpdateCustomPart = async (id) => {
    const formData = new FormData();

    if (updatedName) formData.append("customPart", updatedName);
    if (updatedImage) formData.append("image", updatedImage);

    if (!updatedName && !updatedImage) {
      setError("No hay cambios para actualizar.");
      return;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/api/customParts/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setCustomParts((prevParts) =>
        prevParts.map((part) =>
          part.id === id ? { ...part, ...response.data } : part
        )
      );
      setFilteredParts((prevParts) =>
        prevParts.map((part) =>
          part.id === id ? { ...part, ...response.data } : part
        )
      );

      setSuccess("Pieza actualizada exitosamente.");
      setEditingPart(null);
      setUpdatedName("");
      setUpdatedImage(null);
    } catch (err) {
      setError("Error al actualizar la pieza personalizada. Intenta de nuevo.");
      console.error("Error al actualizar la pieza:", err);
    }
  };

  const handleAddCustomPartClick = () => {
    navigate("/add-custom-part");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "") {
      setFilteredParts(customParts); // Reset the filter when search is cleared
    } else {
      setFilteredParts(
        customParts.filter((part) =>
          [part.id, part.customPart].some((val) =>
            String(val).toLowerCase().includes(value.toLowerCase())
          )
        )
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarDashboard />
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-grill mb-6">
          Lista de Piezas Personalizadas
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 text-center">
            {success}
          </div>
        )}
        <div className="w-full max-w-[89vw] mx-auto border border-dashboard-border rounded-lg shadow-md p-6 bg-dashboard-background">
          {/* Botón de acción */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleAddCustomPartClick}
              className="bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Agregar Pieza Personalizada
            </button>
          </div>

          {/* Campo de búsqueda */}
          <div className="mb-4 flex justify-end">
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:w-72 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
            />
          </div>

          {/* Tabla de piezas personalizadas */}
          {filteredParts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-dashboard-text text-white">
                    <th className="p-3 text-center">ID</th>
                    <th className="p-3 text-center">Nombre</th>
                    <th className="p-3 text-center">Imagen</th>
                    <th className="p-3 text-center">Acciones</th>
                    <th className="p-3 text-center">Actualizar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((part) => (
                    <tr
                      key={part.id}
                      className="border-b border-dashboard-border hover:bg-gray-100 transition-colors"
                    >
                      <td className="p-3 text-center text-dashboard-text">
                        {part.id}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {editingPart === part.id ? (
                          <input
                            type="text"
                            defaultValue={part.customPart}
                            onChange={(e) => setUpdatedName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                          />
                        ) : (
                          part.customPart
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {part.imageFilePath ? (
                          <img
                            src={`http://localhost:8080/uploads/custom-parts/${part.imageFilePath}`}
                            alt={part.customPart}
                            className="w-24 h-auto mx-auto"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "";
                            }}
                          />
                        ) : (
                          <span className="text-dashboard-text">
                            Sin imagen
                          </span>
                        )}
                        {editingPart === part.id && (
                          <div className="mt-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setUpdatedImage(e.target.files[0])
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                            />
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteCustomPart(part.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-lg transition-colors duration-300"
                        >
                          Eliminar
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        {editingPart === part.id ? (
                          <button
                            onClick={() => handleUpdateCustomPart(part.id)}
                            className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded-lg transition-colors duration-300"
                          >
                            Guardar
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingPart(part.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded-lg transition-colors duration-300"
                          >
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-blue-100 text-blue-700 p-4 rounded-lg text-center">
              No hay piezas personalizadas registradas.
            </div>
          )}
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

export default CustomPartList;
