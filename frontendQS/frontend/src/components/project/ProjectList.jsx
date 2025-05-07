import { useEffect, useRef, useState } from "react";
import { FaPlus, FaSortDown, FaSortUp, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import useAuthContext from "../../auth/UseAuthContext";
import ProjectService from "../../services/ProjectService";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [displayedProjects, setDisplayedProjects] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const navigate = useNavigate();
  const { role } = useAuthContext();

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
          setDisplayedProjects(response.data.slice(0, 20));
          setHasMore(response.data.length > 20);
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

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const currentLength = displayedProjects.length;
          const nextProjects = projects.slice(
            currentLength,
            currentLength + 20
          );
          setDisplayedProjects((prev) => [...prev, ...nextProjects]);
          setHasMore(currentLength + nextProjects.length < projects.length);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef && observerRef.current) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
    };
  }, [displayedProjects, hasMore, projects]);

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
      setDisplayedProjects(projects.slice(0, 20));
      setHasMore(projects.length > 20);
    } else {
      const filtered = projects.filter((project) =>
        [project.id, project.clientAlias, project.contact].some((val) =>
          String(val).toLowerCase().includes(value.toLowerCase())
        )
      );
      setDisplayedProjects(filtered.slice(0, 20));
      setHasMore(filtered.length > 20);
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

    const sortedProjects = [...displayedProjects].sort((a, b) => {
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

    setDisplayedProjects(sortedProjects);
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
        setDisplayedProjects((prevDisplayed) =>
          prevDisplayed.filter((project) => project.id !== projectId)
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow mt-5 px-4 sm:px-6 md:px-10 py-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-center sm:text-sm md:text-base">
            {error}
          </div>
        )}
        {showSuccessMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out sm:text-sm md:text-base">
              Proyecto eliminado con éxito
            </div>
          </div>
        )}
        <div
          className={`w-full max-w-[96vw] mx-auto border border-gray-200 rounded-xl shadow-lg p-6 bg-white`}
        >
          {isAdmin && (
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handlePartCustomList}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm md:text-base sm:px-3 md:px-4"
                >
                  <FaPlus className="text-sm sm:text-base" />
                  Crear Pieza
                </button>
                <button
                  onClick={handleMaterialList}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm md:text-base sm:px-3 md:px-4"
                >
                  <FaPlus className="text-sm sm:text-base" />
                  Crear Material
                </button>
              </div>
              <button
                onClick={handleCreateProject}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm md:text-base sm:px-3 md:px-4"
              >
                <FaPlus className="text-sm sm:text-base" />
                Crear Proyecto
              </button>
            </div>
          )}
          <h2
            className={`text-center text-2xl md:text-3xl font-bold mb-2 ${
              isAdmin ? "text-red-600" : "text-blue-800"
            }`}
          >
            Lista de Proyectos
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

          <div className="overflow-x-auto max-h-[calc(100vh-20rem)] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr
                  className={
                    isAdmin
                      ? "bg-gray-600 text-white sticky top-0 z-10"
                      : "bg-gray-600 text-white sticky top-0 z-10"
                  }
                >
                  <th
                    onClick={() => handleSort("createdDate")}
                    className="p-3 text-center cursor-pointer hover:bg-gray-700 transition-colors sm:p-2 md:p-3 sm:hidden md:table-cell"
                  >
                    <div className="flex items-center justify-center gap-1 sm:text-sm md:text-base">
                      Fecha de Creación
                      {sortConfig?.key === "createdDate" &&
                        (sortConfig.direction === "ascending" ? (
                          <FaSortUp className="text-white" />
                        ) : (
                          <FaSortDown className="text-white" />
                        ))}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("id")}
                    className="p-3 text-center cursor-pointer hover:bg-gray-700 transition-colors sm:p-2 md:p-3"
                  >
                    <div className="flex items-center justify-center gap-1 sm:text-sm md:text-base">
                      ID
                      {sortConfig?.key === "id" &&
                        (sortConfig.direction === "ascending" ? (
                          <FaSortUp className="text-white" />
                        ) : (
                          <FaSortDown className="text-white" />
                        ))}
                    </div>
                  </th>
                  {isAdmin && (
                    <th
                      onClick={() => handleSort("clientAlias")}
                      className="p-3 text-center cursor-pointer hover:bg-gray-700 transition-colors sm:p-2 md:p-3 sm:hidden md:table-cell"
                    >
                      <div className="flex items-center justify-center gap-1 sm:text-sm md:text-base">
                        Nombre del Cliente
                        {sortConfig?.key === "clientAlias" &&
                          (sortConfig.direction === "ascending" ? (
                            <FaSortUp className="text-white" />
                          ) : (
                            <FaSortDown className="text-white" />
                          ))}
                      </div>
                    </th>
                  )}
                  {isAdmin && (
                    <th
                      onClick={() => handleSort("contact")}
                      className="p-3 text-center cursor-pointer hover:bg-gray-700 transition-colors sm:p-2 md:p-3 sm:hidden md:table-cell"
                    >
                      <div className="flex items-center justify-center gap-1 sm:text-sm md:text-base">
                        Contacto
                        {sortConfig?.key === "contact" &&
                          (sortConfig.direction === "ascending" ? (
                            <FaSortUp className="text-white" />
                          ) : (
                            <FaSortDown className="text-white" />
                          ))}
                      </div>
                    </th>
                  )}
                  <th
                    onClick={() => handleSort("visitDateTime")}
                    className="p-3 text-center cursor-pointer hover:bg-gray-700 transition-colors sm:p-2 md:p-3 sm:hidden md:table-cell"
                  >
                    <div className="flex items-center justify-center gap-1 sm:text-sm md:text-base">
                      Fecha de Visita
                      {sortConfig?.key === "visitDateTime" &&
                        (sortConfig.direction === "ascending" ? (
                          <FaSortUp className="text-white" />
                        ) : (
                          <FaSortDown className="text-white" />
                        ))}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("installationDateTime")}
                    className="p-3 text-center cursor-pointer hover:bg-gray-700 transition-colors sm:p-2 md:p-3 sm:hidden md:table-cell"
                  >
                    <div className="flex items-center justify-center gap-1 sm:text-sm md:text-base">
                      Fecha de Instalación Estimada
                      {sortConfig?.key === "installationDateTime" &&
                        (sortConfig.direction === "ascending" ? (
                          <FaSortUp className="text-white" />
                        ) : (
                          <FaSortDown className="text-white" />
                        ))}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("pieces")}
                    className="p-3 text-center cursor-pointer hover:bg-gray-700 transition-colors sm:p-2 md:p-3 sm:hidden md:table-cell"
                  >
                    <div className="flex items-center justify-center gap-1 sm:text-sm md:text-base">
                      Piezas
                      {sortConfig?.key === "pieces" &&
                        (sortConfig.direction === "ascending" ? (
                          <FaSortUp className="text-white" />
                        ) : (
                          <FaSortDown className="text-white" />
                        ))}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("state")}
                    className="p-3 text-center cursor-pointer hover:bg-gray-700 transition-colors sm:p-2 md:p-3"
                  >
                    <div className="flex items-center justify-center gap-1 sm:text-sm md:text-base">
                      Estado
                      {sortConfig?.key === "state" &&
                        (sortConfig.direction === "ascending" ? (
                          <FaSortUp className="text-white" />
                        ) : (
                          <FaSortDown className="text-white" />
                        ))}
                    </div>
                  </th>
                  {isAdmin && (
                    <th className="p-3 text-center sticky top-0 bg-gray-600 text-white sm:p-2 md:p-3">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayedProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-gray-800 cursor-pointer sm:p-2 md:p-3 sm:hidden md:table-cell sm:text-sm md:text-base text-wrap leading-5"
                    >
                      {formatDateOnly(project.createdDate)}
                    </td>
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-gray-800 cursor-pointer sm:p-2 md:p-3 sm:text-sm md:text-base text-wrap leading-5"
                    >
                      {project.id}
                    </td>
                    {isAdmin && (
                      <td
                        onClick={() => handleProjectClick(project.id)}
                        className="p-3 text-center text-gray-800 cursor-pointer sm:p-2 md:p-3 sm:hidden md:table-cell sm:text-sm md:text-base text-wrap leading-5"
                      >
                        {project.clientAlias}
                      </td>
                    )}
                    {isAdmin && (
                      <td
                        onClick={() => handleProjectClick(project.id)}
                        className="p-3 text-center text-gray-800 cursor-pointer sm:p-2 md:p-3 sm:hidden md:table-cell sm:text-sm md:text-base text-wrap leading-5"
                      >
                        {project.contact}
                      </td>
                    )}
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-gray-800 cursor-pointer sm:p-2 md:p-3 sm:hidden md:table-cell sm:text-sm md:text-base text-wrap leading-5"
                    >
                      {formatDateTimeWithoutSeconds(project.visitDateTime)}
                    </td>
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-gray-800 cursor-pointer sm:p-2 md:p-3 sm:hidden md:table-cell sm:text-sm md:text-base text-wrap leading-5"
                    >
                      {formatDateTimeWithoutSeconds(
                        project.installationDateTime
                      )}
                    </td>
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-gray-800 cursor-pointer sm:p-2 md:p-3 sm:hidden md:table-cell sm:text-sm md:text-base text-wrap leading-5"
                    >
                      {project.parts ? project.parts.length : 0}
                    </td>
                    <td
                      onClick={() => handleProjectClick(project.id)}
                      className="p-3 text-center text-gray-800 cursor-pointer sm:p-2 md:p-3 sm:text-sm md:text-base text-wrap leading-5"
                    >
                      {project.state ? "En proceso" : "Finalizado"}
                    </td>
                    {isAdmin && (
                      <td className="p-3 sm:p-2 md:p-3 flex items-center justify-center h-full">
                        <FaTrash
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(project.id);
                          }}
                          className="text-red-500 hover:text-red-600 cursor-pointer sm:text-sm md:text-lg transition-colors duration-300 align-middle"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {hasMore && (
              <div
                ref={loadMoreRef}
                className="text-center py-3 sm:text-sm md:text-base"
              >
                <p className="text-gray-500 text-sm">
                  Cargando más proyectos...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all scale-100 sm:p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center sm:text-sm md:text-lg">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-600 mb-6 text-center sm:text-sm md:text-base">
              ¿Estás seguro de que quieres eliminar este proyecto?
            </p>
            <div className="flex justify-center space-x-3 sm:space-x-2 md:space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 sm:text-sm sm:px-3 md:text-base md:px-4"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm sm:px-3 md:text-base md:px-4"
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
