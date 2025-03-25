import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import { getAccessToken } from "../../auth/AuthService";
import ProjectService from "../../services/ProjectService";
import BackButton from "../BackButton";
import FooterDashboard from "./../FooterDashboard";
import NavbarDashboard from "./../NavbarDashboard";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState(null);
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = getAccessToken();

      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        return;
      }

      try {
        console.log("Solicitando lista de proyectos...");
        const response = await ProjectService.fetchProjects({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.success) {
          console.log("Lista de proyectos recibida:", response.data);
          setProjects(response.data);
          setFilteredProjects(response.data);
        } else {
          setError("Error al cargar los proyectos.");
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        if (err.response?.status === 403) {
          setError(
            "Acceso denegado. Verifica que tienes los permisos adecuados."
          );
        } else {
          setError(
            "Error al cargar los proyectos. Por favor, intenta nuevamente."
          );
        }
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (id) => {
    console.log(`Redirigiendo al proyecto con ID: ${id}`);
    navigate(`/projects/${id}`);
  };
  const handleCreateProject = () => navigate("/create-project");
  const handlePartCustomList = () => navigate("/PartCustom-list");
  const handleMaterialList = () => navigate("/material-list");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((project) =>
          [project.id, project.clientAlias, project.contact].some((val) =>
            String(val).toLowerCase().includes(value.toLowerCase())
          )
        )
      );
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }

    const sortedProjects = [...filteredProjects].sort((a, b) => {
      if (
        key === "createdDate" ||
        key === "visitDateTime" ||
        key === "installationDateTime"
      ) {
        return direction === "ascending"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }

      if (key === "pieces") {
        const aValue = a.parts ? a.parts.length : 0;
        const bValue = b.parts ? b.parts.length : 0;
        return direction === "ascending" ? aValue - bValue : bValue - aValue;
      }

      if (typeof a[key] === "number") {
        return direction === "ascending" ? a[key] - b[key] : b[key] - a[key];
      }

      return direction === "ascending"
        ? String(a[key]).localeCompare(String(b[key]))
        : String(b[key]).localeCompare(String(a[key]));
    });

    setFilteredProjects(sortedProjects);
    setSortConfig({ key, direction });
  };

  const formatDateOnly = (date) => new Date(date).toLocaleDateString();
  const formatDateTimeWithoutSeconds = (date) =>
    new Date(date).toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarDashboard />
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-grill mb-6">
          Lista de Proyectos
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <div className="w-full max-w-[89vw] mx-auto border border-dashboard-border rounded-lg shadow-md p-6 bg-dashboard-background">
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePartCustomList}
                className="bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Crear Pieza
              </button>
              <button
                onClick={handleMaterialList}
                className="bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Crear Material
              </button>
            </div>
            <button
              onClick={handleCreateProject}
              className="bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Crear Proyecto
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

          {/* Tabla de proyectos */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-dashboard-text text-white">
                  <th
                    onClick={() => handleSort("createdDate")}
                    className="p-3 text-center cursor-pointer hover:bg-[#4A5157] transition-colors"
                  >
                    Fecha de Creación
                  </th>
                  <th
                    onClick={() => handleSort("id")}
                    className="p-3 text-center cursor-pointer hover:bg-[#4A5157] transition-colors"
                  >
                    ID
                  </th>
                  <th
                    onClick={() => handleSort("clientAlias")}
                    className="p-3 text-center cursor-pointer hover:bg-[#4A5157] transition-colors"
                  >
                    Nombre del Cliente
                  </th>
                  <th
                    onClick={() => handleSort("contact")}
                    className="p-3 text-center cursor-pointer hover:bg-[#4A5157] transition-colors"
                  >
                    Contacto
                  </th>
                  <th
                    onClick={() => handleSort("visitDateTime")}
                    className="p-3 text-center cursor-pointer hover:bg-[#4A5157] transition-colors"
                  >
                    Fecha de Visita
                  </th>
                  <th
                    onClick={() => handleSort("installationDateTime")}
                    className="p-3 text-center cursor-pointer hover:bg-[#4A5157] transition-colors"
                  >
                    Fecha de Instalación
                  </th>
                  <th
                    onClick={() => handleSort("pieces")}
                    className="p-3 text-center cursor-pointer hover:bg-[#4A5157] transition-colors"
                  >
                    Piezas
                  </th>
                  <th
                    onClick={() => handleSort("state")}
                    className="p-3 text-center cursor-pointer hover:bg-[#4A5157] transition-colors"
                  >
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className="border-b border-dashboard-border hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <td className="p-3 text-center text-dashboard-text">
                      {formatDateOnly(project.createdDate)}
                    </td>
                    <td className="p-3 text-center text-dashboard-text">
                      {project.id}
                    </td>
                    <td className="p-3 text-center text-dashboard-text">
                      {project.clientAlias}
                    </td>
                    <td className="p-3 text-center text-dashboard-text">
                      {project.contact}
                    </td>
                    <td className="p-3 text-center text-dashboard-text">
                      {formatDateTimeWithoutSeconds(project.visitDateTime)}
                    </td>
                    <td className="p-3 text-center text-dashboard-text">
                      {formatDateTimeWithoutSeconds(
                        project.installationDateTime
                      )}
                    </td>
                    <td className="p-3 text-center text-dashboard-text">
                      {project.parts ? project.parts.length : 0}
                    </td>
                    <td className="p-3 text-center text-dashboard-text">
                      {project.state ? "En proceso" : "Finalizado"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

export default ProjectList;
