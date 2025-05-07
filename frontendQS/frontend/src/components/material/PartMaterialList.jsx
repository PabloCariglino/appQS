import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import useAuthContext from "../../auth/UseAuthContext";

const PartMaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { role } = useAuthContext();
  const wrapperRef = useRef(null);

  const basePath = role === "ADMIN" ? "/admin" : "/operator";

  useEffect(() => {
    const fetchMaterials = async () => {
      const token = getAccessToken();

      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8080/api/part-materials/material-list",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMaterials(response.data);
        setFilteredMaterials(response.data);
      } catch (err) {
        console.error("Error al obtener los materiales:", err);
        setError("Error al cargar los materiales. Inténtalo de nuevo.");
      }
    };

    fetchMaterials();
  }, []);

  const handleDeleteMaterial = async (id) => {
    const token = getAccessToken();

    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/part-materials/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMaterials((prevMaterials) =>
        prevMaterials.filter((material) => material.id !== id)
      );
      setFilteredMaterials((prevMaterials) =>
        prevMaterials.filter((material) => material.id !== id)
      );
      setSuccess("Material eliminado exitosamente.");
    } catch (err) {
      console.error("Error al eliminar el material:", err);
      setError("Error al eliminar el material. Inténtalo de nuevo.");
    }
  };

  const handleUpdateMaterial = async (id) => {
    if (!hasChanges) {
      setError("No hay cambios para actualizar.");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/part-materials/${id}`,
        { materialName: updatedName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMaterials((prevMaterials) =>
        prevMaterials.map((material) =>
          material.id === id
            ? { ...material, materialName: updatedName }
            : material
        )
      );
      setFilteredMaterials((prevMaterials) =>
        prevMaterials.map((material) =>
          material.id === id
            ? { ...material, materialName: updatedName }
            : material
        )
      );

      setSuccess("Material actualizado exitosamente.");
      setShowUpdateModal(true);
      setEditingMaterial(null);
      setUpdatedName("");
      setHasChanges(false);

      setTimeout(() => {
        setShowUpdateModal(false);
      }, 3000);
    } catch (err) {
      console.error("Error al actualizar el material:", err);
      setError("Error al actualizar el material. Inténtalo de nuevo.");
    }
  };

  const handleAddMaterialClick = () => {
    navigate(`${basePath}/add-part-material`);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "") {
      setFilteredMaterials(materials);
    } else {
      setFilteredMaterials(
        materials.filter((material) =>
          [material.id, material.materialName].some((val) =>
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

  const startEditing = (material) => {
    setEditingMaterial(material.id);
    setUpdatedName(material.materialName);
    setHasChanges(false);
  };

  const handleClickOutside = (e) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(e.target) &&
      editingMaterial &&
      !hasChanges
    ) {
      setEditingMaterial(null);
      setUpdatedName("");
      setHasChanges(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingMaterial, hasChanges]);

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
                onClick={handleAddMaterialClick}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm md:text-base sm:px-3 md:px-4"
              >
                <FaPlus className="text-sm sm:text-base" />
                Agregar Material
              </button>
            </div>
          )}
          <h2 className="text-center text-2xl md:text-3xl font-bold text-red-600 mb-2">
            Lista de Materiales
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

          {filteredMaterials.length > 0 ? (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-20rem)]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-600 text-white sticky top-0 z-10">
                    <th className="p-3 text-center">ID</th>
                    <th className="p-3 text-center">Nombre del Material</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((material) => (
                    <tr
                      key={material.id}
                      className="border-b border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <td className="p-3 text-center text-gray-800">
                        {material.id}
                      </td>
                      <td className="p-3 text-center text-gray-800">
                        {editingMaterial === material.id ? (
                          <div className="flex items-center justify-center">
                            <input
                              type="text"
                              defaultValue={material.materialName}
                              onChange={handleNameChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                            <button
                              onClick={() => handleUpdateMaterial(material.id)}
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
                            {material.materialName}
                            <button
                              onClick={() => startEditing(material)}
                              className="ml-2 text-yellow-500 hover:text-yellow-600"
                            >
                              ✏️
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-3 flex items-center justify-center">
                        <FaTrash
                          onClick={() => handleDeleteMaterial(material.id)}
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
              No hay materiales registrados.
            </div>
          )}
        </div>

        {showUpdateModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center animate-fade-in">
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                ¡Material Actualizado con Éxito!
              </h3>
              <p className="text-gray-500 text-sm">
                El material ha sido actualizado correctamente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartMaterialList;
