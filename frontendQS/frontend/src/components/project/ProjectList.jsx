import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import useAuthContext from "../../auth/UseAuthContext"; // Añadimos esta importación para obtener el rol
import ProjectService from "../../services/ProjectService";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const { role } = useAuthContext(); // Usamos useAuthContext en lugar de AuthContext para consistencia

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

  const basePath = role === "ADMIN" ? "/admin" : "/operator";

  const handleProjectClick = (id) => {
    console.log(`Redirigiendo al proyecto con ID: ${id}`);
    navigate(`${basePath}/projects/${id}`);
  };

  const handleCreateProject = () => navigate(`${basePath}/create-project`);
  const handlePartCustomList = () => navigate(`${basePath}/PartCustom-list`);
  const handleMaterialList = () => navigate(`${basePath}/material-list`);

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

  const handleDeleteProject = async (projectId) => {
    const token = getAccessToken();
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }

    try {
      const response = await ProjectService.deleteProject(projectId);

      if (response.success) {
        setProjects((prevProjects) =>
          prevProjects.filter((project) => project.id !== projectId)
        );
        setFilteredProjects((prevFiltered) =>
          prevFiltered.filter((project) => project.id !== projectId)
        );

        console.log(`Proyecto con ID ${projectId} eliminado con éxito.`);

        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        setError(response.message || "Error al eliminar el proyecto.");
      }
    } catch (err) {
      console.error("Error al eliminar el proyecto:", err);
      setError("Error al eliminar el proyecto. Por favor, intenta nuevamente.");
    }
  };

  const openDeleteModal = (projectId) => {
    setProjectToDelete(projectId);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      handleDeleteProject(projectToDelete);
    }
    setShowModal(false);
    setProjectToDelete(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setProjectToDelete(null);
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

  const isAdmin = role === "ADMIN";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
        <h2
          className={`text-center text-3xl md:text-4xl font-bold mb-6 ${
            isAdmin ? "text-grill" : "text-blue-800"
          }`}
        >
          Lista de Proyectos
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        {showSuccessMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg animate-fade-in-out">
              Proyecto eliminado con éxito
            </div>
          </div>
        )}
        <div
          className={`w-full max-w-[89vw] mx-auto border border-dashboard-border rounded-lg shadow-md p-6 ${
            isAdmin ? "bg-dashboard-background" : "bg-gray-50"
          }`}
        >
          {isAdmin && (
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
          )}

          <div className="mb-4 flex justify-end">
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:w-72 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className={
                    isAdmin
                      ? "bg-dashboard-text text-white"
                      : "bg-gray-600 text-white"
                  }
                >
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
                  {isAdmin && (
                    <th
                      onClick={() => handleSort("clientAlias")}
                      className="p-3 text-center cursor-pointer hover:bg-[#4A5157] transition-colors"
                    >
                      Nombre del Cliente
                    </th>
                  )}
                  {isAdmin && (
                    <th
                      onClick={() => handleSort("contact")}
                      className="p-3 text-center cursor-pointer hover:bg-[#4A5157] transition-colors"
                    >
                      Contacto
                    </th>
                  )}
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
                    Fecha de Instalación Estimada
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
                  {isAdmin && <th className="p-3 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-dashboard-border hover:bg-gray-100 transition-colors"
                  >
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-dashboard-text cursor-pointer"
                    >
                      {formatDateOnly(project.createdDate)}
                    </td>
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-dashboard-text cursor-pointer"
                    >
                      {project.id}
                    </td>
                    {isAdmin && (
                      <td
                        onClick={() => handleProjectClick(project.id)}
                        className="p-3 text-center text-dashboard-text cursor-pointer"
                      >
                        {project.clientAlias}
                      </td>
                    )}
                    {isAdmin && (
                      <td
                        onClick={() => handleProjectClick(project.id)}
                        className="p-3 text-center text-dashboard-text cursor-pointer"
                      >
                        {project.contact}
                      </td>
                    )}
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-dashboard-text cursor-pointer"
                    >
                      {formatDateTimeWithoutSeconds(project.visitDateTime)}
                    </td>
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-dashboard-text cursor-pointer"
                    >
                      {formatDateTimeWithoutSeconds(
                        project.installationDateTime
                      )}
                    </td>
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-dashboard-text cursor-pointer"
                    >
                      {project.parts ? project.parts.length : 0}
                    </td>
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-dashboard-text cursor-pointer"
                    >
                      {project.state ? "En proceso" : "Finalizado"}
                    </td>
                    {isAdmin && (
                      <td className="p-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(project.id);
                          }}
                          className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Confirmar Eliminación
            </h3>
            <p>¿Estás seguro de que quieres eliminar este proyecto?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
