import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import useAuthContext from "../../auth/UseAuthContext";
import CustomPartService from "../../services/CustomPartService";

const CustomPartList = () => {
  const [customParts, setCustomParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingPart, setEditingPart] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedImage, setUpdatedImage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { role } = useAuthContext();
  const wrapperRef = useRef(null);

  const basePath = role === "ADMIN" ? "/admin" : "/operator";

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
      setShowUpdateModal(true);
      setEditingPart(null);
      setUpdatedName("");
      setUpdatedImage(null);
      setHasChanges(false);

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
    navigate(`${basePath}/add-custom-part`);
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

  const handleNameChange = (e) => {
    setUpdatedName(e.target.value);
    setHasChanges(true);
  };

  const handleImageChange = (e) => {
    setUpdatedImage(e.target.files[0]);
    setHasChanges(true);
  };

  const startEditing = (part) => {
    setEditingPart(part.id);
    setUpdatedName(part.customPartName);
    setUpdatedImage(null);
    setHasChanges(false);
  };

  const handleClickOutside = (e) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(e.target) &&
      editingPart &&
      !hasChanges
    ) {
      setEditingPart(null);
      setUpdatedName("");
      setUpdatedImage(null);
      setHasChanges(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingPart, hasChanges]);

  return (
    <div
      ref={wrapperRef}
      className="min-h-screen flex flex-col bg-gray-50"
      onClick={handleClickOutside}
    >
      <div className="flex-grow mt-5 px-4 sm:px-6 md:px-10 py-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-center sm:text-sm md:text-base">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 text-center">
            {success}
          </div>
        )}
        <div className="w-full max-w-[96vw] mx-auto border border-gray-200 rounded-xl shadow-lg p-6 bg-white">
          {role === "ADMIN" && (
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-3">
              <button
                onClick={handleAddCustomPartClick}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm md:text-base sm:px-3 md:px-4"
              >
                <FaPlus className="text-sm sm:text-base" />
                Agregar Pieza Personalizada
              </button>
            </div>
          )}
          <h2 className="text-center text-2xl md:text-3xl font-bold text-red-600 mb-2">
            Lista de Piezas Personalizadas
          </h2>
          <div className="mb-6 flex justify-center">
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:w-64 p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
            />
          </div>

          {filteredParts.length > 0 ? (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-20rem)]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-600 text-white sticky top-0 z-10">
                    <th className="p-3 text-center">ID</th>
                    <th className="p-3 text-center">Nombre</th>
                    <th className="p-3 text-center">Imagen</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((part) => (
                    <tr
                      key={part.id}
                      className="border-b border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <td className="p-3 text-center text-gray-800">
                        {part.id}
                      </td>
                      <td className="p-3 text-center text-gray-800">
                        {editingPart === part.id ? (
                          <div className="flex items-center justify-center">
                            <input
                              type="text"
                              defaultValue={part.customPartName}
                              onChange={handleNameChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                            <button
                              onClick={() => handleUpdateCustomPart(part.id)}
                              disabled={!hasChanges}
                              className={`ml-2 font-medium py-1 px-3 rounded-lg transition-colors duration-300 ${
                                hasChanges
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              Guardar
                            </button>
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
                            className="w-16 h-16 object-cover rounded-md mx-auto"
                          />
                        ) : (
                          <span className="text-gray-800">Sin imagen</span>
                        )}
                        {editingPart === part.id && (
                          <div className="mt-2 flex items-center justify-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                            <span className="ml-2 text-yellow-500">✏️</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 flex items-center justify-center">
                        <FaTrash
                          onClick={() => handleDeleteCustomPart(part.id)}
                          className="text-red-500 hover:text-red-600 cursor-pointer sm:text-sm md:text-lg transition-colors duration-300 align-middle"
                        />
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

        {showUpdateModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center animate-fade-in">
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                ¡Pieza Actualizada con Éxito!
              </h3>
              <p className="text-gray-500 text-sm">
                La pieza ha sido actualizada correctamente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomPartList;
