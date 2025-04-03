import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import CustomPartService from "../../services/CustomPartService";
import BackButton from "../BackButton";
import FooterDashboard from "./../FooterDashboard";
import NavbarDashboard from "./../NavbarDashboard";

const CustomPartList = () => {
  const [customParts, setCustomParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingPart, setEditingPart] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedImage, setUpdatedImage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false); // Nuevo estado para rastrear cambios
  const [showUpdateModal, setShowUpdateModal] = useState(false); // Estado para el modal de actualización
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
    }
  }, []);

  useEffect(() => {
    const fetchCustomParts = async () => {
      try {
        const parts = await CustomPartService.fetchCustomParts();
        setCustomParts(parts);
        setFilteredParts(parts);

        // Cargar las imágenes dinámicamente
        const token = getAccessToken();
        if (!token) {
          setError("No estás autenticado. No se pueden cargar las imágenes.");
          return;
        }

        const imagePromises = parts.map(async (part) => {
          if (part.imageFilePath) {
            try {
              const response = await axios.get(
                `http://localhost:8080/image-custom-part/${part.imageFilePath}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                  responseType: "blob",
                }
              );
              const imageUrl = URL.createObjectURL(response.data);
              return { id: part.id, url: imageUrl };
            } catch (err) {
              console.error(
                `Error al cargar la imagen para la pieza ${part.id}:`,
                err
              );
              return { id: part.id, url: "/images/placeholder.png" };
            }
          }
          return { id: part.id, url: null };
        });

        const images = await Promise.all(imagePromises);
        const imageUrlMap = images.reduce((acc, { id, url }) => {
          acc[id] = url;
          return acc;
        }, {});
        setImageUrls(imageUrlMap);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Error al obtener las piezas personalizadas. Intenta de nuevo."
        );
        console.error("Error al obtener las piezas:", err);
      }
    };

    fetchCustomParts();
  }, []);

  const handleDeleteCustomPart = async (id) => {
    try {
      await CustomPartService.deleteCustomPart(id);
      setCustomParts((prevParts) => prevParts.filter((part) => part.id !== id));
      setFilteredParts((prevParts) =>
        prevParts.filter((part) => part.id !== id)
      );
      setImageUrls((prevUrls) => {
        const newUrls = { ...prevUrls };
        delete newUrls[id];
        return newUrls;
      });
      setSuccess("Pieza eliminada exitosamente.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al eliminar la pieza personalizada. Intenta de nuevo."
      );
      console.error("Error al eliminar la pieza:", err);
    }
  };

  const handleUpdateCustomPart = async (id) => {
    if (!hasChanges) {
      setError("No hay cambios para actualizar.");
      return;
    }

    try {
      const updatedPart = await CustomPartService.updateCustomPart(
        id,
        updatedName,
        updatedImage
      );
      setCustomParts((prevParts) =>
        prevParts.map((part) =>
          part.id === id ? { ...part, ...updatedPart } : part
        )
      );
      setFilteredParts((prevParts) =>
        prevParts.map((part) =>
          part.id === id ? { ...part, ...updatedPart } : part
        )
      );

      // Actualizar la imagen si se subió una nueva
      if (updatedPart.imageFilePath && updatedImage) {
        const token = getAccessToken();
        if (!token) {
          setError("No estás autenticado. No se puede cargar la nueva imagen.");
          return;
        }
        const response = await axios.get(
          `http://localhost:8080/image-custom-part/${updatedPart.imageFilePath}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "blob",
          }
        );
        const imageUrl = URL.createObjectURL(response.data);
        setImageUrls((prevUrls) => ({
          ...prevUrls,
          [id]: imageUrl,
        }));
      }

      setSuccess("Pieza actualizada exitosamente.");
      setShowUpdateModal(true); // Mostrar el modal de confirmación
      setEditingPart(null);
      setUpdatedName("");
      setUpdatedImage(null);
      setHasChanges(false); // Reiniciar el estado de cambios

      // Ocultar el modal después de 3 segundos
      setTimeout(() => {
        setShowUpdateModal(false);
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al actualizar la pieza personalizada. Intenta de nuevo."
      );
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
      setFilteredParts(customParts);
    } else {
      setFilteredParts(
        customParts.filter((part) =>
          [part.id, part.customPartName].some((val) =>
            String(val).toLowerCase().includes(value.toLowerCase())
          )
        )
      );
    }
  };

  // Detectar cambios en el nombre o la imagen
  const handleNameChange = (e) => {
    setUpdatedName(e.target.value);
    setHasChanges(true);
  };

  const handleImageChange = (e) => {
    setUpdatedImage(e.target.files[0]);
    setHasChanges(true);
  };

  // Iniciar edición y establecer el nombre inicial
  const startEditing = (part) => {
    setEditingPart(part.id);
    setUpdatedName(part.customPartName);
    setUpdatedImage(null);
    setHasChanges(false);
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
          <div className="flex justify-end mb-4">
            <button
              onClick={handleAddCustomPartClick}
              className="bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Agregar Pieza Personalizada
            </button>
          </div>

          <div className="mb-4 flex justify-end">
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:w-72 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
            />
          </div>

          {filteredParts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-dashboard-text text-white">
                    <th className="p-3 text-center">ID</th>
                    <th className="p-3 text-center">Nombre</th>
                    <th className="p-3 text-center">Imagen</th>
                    <th className="p-3 text-center">Actualizar</th>
                    <th className="p-3 text-center">Acciones</th>
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
                          <div className="flex items-center justify-center">
                            <input
                              type="text"
                              defaultValue={part.customPartName}
                              onChange={handleNameChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                            />
                            <span className="ml-2 text-yellow-500">✏️</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            {part.customPartName}
                            <button
                              onClick={() => startEditing(part)}
                              className="ml-2 text-yellow-500 hover:text-yellow-600"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {part.imageFilePath && imageUrls[part.id] ? (
                          <img
                            src={imageUrls[part.id]}
                            alt={part.customPartName || "Pieza personalizada"}
                            className="w-24 h-auto mx-auto"
                          />
                        ) : (
                          <span className="text-dashboard-text">
                            Sin imagen
                          </span>
                        )}
                        {editingPart === part.id && (
                          <div className="mt-2 flex items-center justify-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                            />
                            <span className="ml-2 text-yellow-500">✏️</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {editingPart === part.id ? (
                          <button
                            onClick={() => handleUpdateCustomPart(part.id)}
                            disabled={!hasChanges}
                            className={`font-medium py-1 px-3 rounded-lg transition-colors duration-300 ${
                              hasChanges
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            Guardar
                          </button>
                        ) : (
                          <button
                            onClick={() => startEditing(part)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded-lg transition-colors duration-300"
                          >
                            Editar
                          </button>
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

        {/* Modal animado para confirmación de actualización */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center animate-fade-in">
              <h3 className="text-2xl font-bold text-grill mb-4">
                ¡Pieza Actualizada con Éxito!
              </h3>
              <p className="text-gray-500 text-sm">
                La pieza ha sido actualizada correctamente.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <BackButton />
        </div>
      </div>
      <FooterDashboard />
    </div>
  );
};

export default CustomPartList;
