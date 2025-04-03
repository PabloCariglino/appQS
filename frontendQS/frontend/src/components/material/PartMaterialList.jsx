import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import BackButton from "../BackButton";
import FooterDashboard from "./../FooterDashboard";
import NavbarDashboard from "./../NavbarDashboard";

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

      // Ocultar el modal después de 3 segundos
      setTimeout(() => {
        setShowUpdateModal(false);
      }, 3000);
    } catch (err) {
      console.error("Error al actualizar el material:", err);
      setError("Error al actualizar el material. Inténtalo de nuevo.");
    }
  };

  const handleAddMaterialClick = () => {
    navigate("/add-part-material");
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

  // Detectar cambios en el nombre
  const handleNameChange = (e) => {
    setUpdatedName(e.target.value);
    setHasChanges(true);
  };

  // Iniciar edición y establecer el nombre inicial
  const startEditing = (material) => {
    setEditingMaterial(material.id);
    setUpdatedName(material.materialName);
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarDashboard />
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-grill mb-6">
          Lista de Materiales
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
              onClick={handleAddMaterialClick}
              className="bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Agregar Material
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

          {filteredMaterials.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-dashboard-text text-white">
                    <th className="p-3 text-center">ID</th>
                    <th className="p-3 text-center">Nombre del Material</th>
                    <th className="p-3 text-center">Actualizar</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.map((material) => (
                    <tr
                      key={material.id}
                      className="border-b border-dashboard-border hover:bg-gray-100 transition-colors"
                    >
                      <td className="p-3 text-center text-dashboard-text">
                        {material.id}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {editingMaterial === material.id ? (
                          <div className="flex items-center justify-center">
                            <input
                              type="text"
                              defaultValue={material.materialName}
                              onChange={handleNameChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                            />
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
                      <td className="p-3 text-center">
                        {editingMaterial === material.id ? (
                          <button
                            onClick={() => handleUpdateMaterial(material.id)}
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
                            onClick={() => startEditing(material)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded-lg transition-colors duration-300"
                          >
                            Editar
                          </button>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
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
              No hay materiales registrados.
            </div>
          )}
        </div>

        {/* Modal animado para confirmación de actualización */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center animate-fade-in">
              <h3 className="text-2xl font-bold text-grill mb-4">
                ¡Material Actualizado con Éxito!
              </h3>
              <p className="text-gray-500 text-sm">
                El material ha sido actualizado correctamente.
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

export default PartMaterialList;
