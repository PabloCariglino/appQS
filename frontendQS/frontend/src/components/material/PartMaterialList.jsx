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
        setFilteredMaterials(response.data); // Inicializa el filtro
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
    } catch (err) {
      console.error("Error al eliminar el material:", err);
      setError("Error al eliminar el material. Inténtalo de nuevo.");
    }
  };

  const handleAddMaterialClick = () => {
    navigate("/add-part-material");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "") {
      setFilteredMaterials(materials); // Reset the filter when search is cleared
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
        <div className="w-full max-w-[89vw] mx-auto border border-dashboard-border rounded-lg shadow-md p-6 bg-dashboard-background">
          {/* Botón de acción */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleAddMaterialClick}
              className="bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Agregar Material
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

          {/* Tabla de materiales */}
          {filteredMaterials.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-dashboard-text text-white">
                    <th className="p-3 text-center">ID</th>
                    <th className="p-3 text-center">Nombre del Material</th>
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
                        {material.materialName}
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

        {/* Botón Volver centrado */}
        <div className="mt-6 flex justify-center">
          <BackButton />
        </div>
      </div>
      <FooterDashboard />
    </div>
  );
};

export default PartMaterialList;
