import { useEffect, useState } from "react";
import { FaPencilAlt, FaSortDown, FaSortUp, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import PartService from "../../services/PartService";
import ProjectService from "../../services/ProjectService";
import QrCodeService from "../../services/QrCodeService";
import BackButton from "../BackButton";
import FooterDashboard from "./../FooterDashboard";
import NavbarDashboard from "./../NavbarDashboard";

// Hook personalizado para manejar la confirmación al salir
const useBeforeUnload = (hasUnsavedChanges) => {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [originalProject, setOriginalProject] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrImageUrls, setQrImageUrls] = useState({});
  const [isLoadingQr, setIsLoadingQr] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  // Cargar el proyecto
  useEffect(() => {
    const fetchProject = async () => {
      const token = getAccessToken();

      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión.");
        navigate("/login");
        return;
      }

      try {
        console.log(`Obteniendo proyecto con ID: ${id}`);
        const response = await ProjectService.fetchProjectById(id);
        console.log("Respuesta de fetchProjectById:", response);

        if (response.success) {
          setProject(response.data);
          setOriginalProject(JSON.parse(JSON.stringify(response.data)));
        } else {
          setError("Error al obtener los detalles del proyecto.");
        }
      } catch (err) {
        setError(
          "Error al obtener los detalles del proyecto. Verifica tu conexión o permisos."
        );
        console.error("Error fetching project data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  // Cargar las imágenes QR
  useEffect(() => {
    const loadQrImages = async () => {
      if (!project || !project.parts) return;

      const newLoadingState = {};
      const newUrls = {};
      let shouldRedirect = false;

      for (const part of project.parts) {
        if (part.qrCodeFilePath) {
          newLoadingState[part.qrCodeFilePath] = true;
        }
      }
      setIsLoadingQr(newLoadingState);

      for (const part of project.parts) {
        if (part.qrCodeFilePath && !shouldRedirect) {
          try {
            const cleanFilename =
              part.qrCodeFilePath.split("\\").pop() ||
              part.qrCodeFilePath.split("/").pop() ||
              part.qrCodeFilePath;
            console.log(`Intentando cargar QR para ${cleanFilename}`);
            const response = await QrCodeService.getQRCodeImage(cleanFilename);
            if (response.success) {
              const url = URL.createObjectURL(response.data);
              newUrls[part.qrCodeFilePath] = url;
              console.log(`URL generada para ${part.qrCodeFilePath}:`, url);
            } else {
              if (response.message.includes("401")) {
                setError(
                  "Sesión expirada. Por favor, inicia sesión nuevamente."
                );
                shouldRedirect = true;
                break;
              }
              throw new Error(
                `Error al obtener la imagen del QR: ${response.message}`
              );
            }
          } catch (err) {
            console.error(
              `Error al cargar QR para ${part.qrCodeFilePath}:`,
              err.message
            );
            newUrls[part.qrCodeFilePath] = "/placeholder-qr.png";
          }
          newLoadingState[part.qrCodeFilePath] = false;
        }
      }

      if (!shouldRedirect) {
        setQrImageUrls(newUrls);
        setIsLoadingQr((prev) => ({ ...prev, ...newLoadingState }));
      }

      if (shouldRedirect) {
        navigate("/login");
      }
    };

    if (project && project.parts) {
      loadQrImages();
    }

    return () => {
      Object.values(qrImageUrls).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      setQrImageUrls({});
    };
  }, [project, navigate]);

  // Detectar cambios no guardados
  useEffect(() => {
    const hasChanges =
      JSON.stringify(project) !== JSON.stringify(originalProject);
    setHasUnsavedChanges(hasChanges);
  }, [project, originalProject]);

  // Confirmación al salir sin guardar cambios
  useBeforeUnload(hasUnsavedChanges);

  useEffect(() => {
    const unblock = () => {
      if (hasUnsavedChanges) {
        const confirmExit = window.confirm(
          "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?"
        );
        if (!confirmExit) {
          navigate(location.pathname, { replace: true });
          return false;
        }
      }
      return true;
    };

    const handleNavigation = (e) => {
      if (!unblock()) {
        e.preventDefault();
      }
    };

    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, [hasUnsavedChanges, navigate, location.pathname]);

  // Funciones de edición
  const startEditing = (field, partId = null) => {
    setEditingField({ field, partId });
  };

  const handleProjectChange = (field, value) => {
    setProject((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePartChange = (partId, field, value) => {
    setProject((prev) => ({
      ...prev,
      parts: prev.parts.map((part) =>
        part.id === partId ? { ...part, [field]: value } : part
      ),
    }));
  };

  const stopEditing = () => {
    setEditingField(null);
  };

  // Guardar cambios
  const saveChanges = async () => {
    try {
      // Actualizar el proyecto
      const projectResponse = await ProjectService.updateProject(project.id, {
        clientAlias: project.clientAlias,
        contact: project.contact,
        state: project.state,
        visitDateTime: project.visitDateTime,
        installationDateTime: project.installationDateTime,
      });

      if (!projectResponse.success) {
        throw new Error(
          `Error al actualizar el proyecto: ${projectResponse.message}`
        );
      }

      const projectChanged =
        JSON.stringify({
          clientAlias: originalProject.clientAlias,
          contact: originalProject.contact,
          state: originalProject.state,
          visitDateTime: originalProject.visitDateTime,
          installationDateTime: originalProject.installationDateTime,
        }) !==
        JSON.stringify({
          clientAlias: project.clientAlias,
          contact: project.contact,
          state: project.state,
          visitDateTime: project.visitDateTime,
          installationDateTime: project.installationDateTime,
        });

      const updatedParts = [];
      for (const part of project.parts) {
        const originalPart = originalProject.parts.find(
          (p) => p.id === part.id
        );
        const partChanged =
          JSON.stringify({
            totalweightKg: originalPart.totalweightKg,
            sheetThicknessMm: originalPart.sheetThicknessMm,
            lengthPiecesMm: originalPart.lengthPiecesMm,
            heightMm: originalPart.heightMm,
            widthMm: originalPart.widthMm,
            observations: originalPart.observations,
            receptionState: originalPart.receptionState,
            qualityControlState: originalPart.qualityControlState,
          }) !==
          JSON.stringify({
            totalweightKg: part.totalweightKg,
            sheetThicknessMm: part.sheetThicknessMm,
            lengthPiecesMm: part.lengthPiecesMm,
            heightMm: part.heightMm,
            widthMm: part.widthMm,
            observations: part.observations,
            receptionState: part.receptionState,
            qualityControlState: part.qualityControlState,
          });

        if (partChanged) {
          // Actualizar la pieza en el backend
          const partResponse = await PartService.updatePart(part.id, {
            customPart: part.customPart,
            partMaterial: part.partMaterial,
            totalweightKg: part.totalweightKg,
            sheetThicknessMm: part.sheetThicknessMm,
            lengthPiecesMm: part.lengthPiecesMm,
            heightMm: part.heightMm,
            widthMm: part.widthMm,
            observations: part.observations,
            receptionState: part.receptionState,
            qualityControlState: part.qualityControlState,
          });

          if (!partResponse.success) {
            throw new Error(
              `Error al actualizar la pieza ${part.id}: ${partResponse.message}`
            );
          }
        }

        if (projectChanged || partChanged) {
          // Eliminar el QR existente si existe
          if (part.qrCodeFilePath) {
            const qrCodeId = part.qrCodeFilePath.split("_part_qr.png")[0];
            const qrDeleteResponse = await QrCodeService.deleteQRCode(qrCodeId);
            if (!qrDeleteResponse.success) {
              throw new Error(
                `Error al eliminar el QR de la pieza ${part.id}: ${qrDeleteResponse.message}`
              );
            }
          }

          // Generar un nuevo QR
          const qrData = {
            id: part.id, // Añadimos el ID de la pieza
            project: { id: project.id }, // Añadimos el proyecto
            customPart: part.customPart, // Añadimos customPart
            partMaterial: part.partMaterial, // Añadimos partMaterial
            clientAlias: project.clientAlias,
            contact: project.contact,
            state: project.state,
            visitDateTime: project.visitDateTime,
            installationDateTime: project.installationDateTime,
            totalweightKg: part.totalweightKg,
            sheetThicknessMm: part.sheetThicknessMm,
            lengthPiecesMm: part.lengthPiecesMm,
            heightMm: part.heightMm,
            widthMm: part.widthMm,
            observations: part.observations,
            receptionState: part.receptionState,
            qualityControlState: part.qualityControlState,
          };

          const qrResponse = await QrCodeService.generateQRCode(qrData);
          if (qrResponse.success) {
            updatedParts.push({
              ...part,
              qrCodeFilePath: qrResponse.data.filePath, // Ajustamos a filePath según la respuesta del backend
            });
          } else {
            throw new Error(
              `Error al regenerar el QR de la pieza ${part.id}: ${qrResponse.message}`
            );
          }
        } else {
          updatedParts.push(part);
        }
      }

      // Actualizar el estado del proyecto y las piezas
      setProject((prev) => ({
        ...prev,
        parts: updatedParts,
      }));
      setOriginalProject(
        JSON.parse(JSON.stringify({ ...project, parts: updatedParts }))
      );
      setHasUnsavedChanges(false);
      alert("Cambios guardados exitosamente");
    } catch (err) {
      setError(`Error al guardar los cambios: ${err.message}`);
      console.error("Error saving changes:", err);
    }
  };

  // Eliminar una pieza
  const deletePart = async (partId) => {
    try {
      const part = project.parts.find((p) => p.id === partId);
      if (part.qrCodeFilePath) {
        const qrCodeId = part.qrCodeFilePath.split("_part_qr.png")[0];
        await QrCodeService.deleteQRCode(qrCodeId);
      }

      const response = await PartService.deletePart(partId);
      if (response.success) {
        setProject((prev) => ({
          ...prev,
          parts: prev.parts.filter((p) => p.id !== partId),
        }));
        setOriginalProject((prev) => ({
          ...prev,
          parts: prev.parts.filter((p) => p.id !== partId),
        }));
        setShowDeleteModal(null);
      } else {
        throw new Error("Error al eliminar la pieza");
      }
    } catch (err) {
      setError("Error al eliminar la pieza. Intenta nuevamente.");
      console.error("Error deleting part:", err);
    }
  };

  // Funciones de búsqueda y ordenamiento
  const filteredParts = project?.parts?.filter((part) =>
    part.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedParts = [...(filteredParts || [])].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavbarDashboard />
        <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10 text-center text-dashboard-text">
          Cargando...
        </div>
        <FooterDashboard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavbarDashboard />
        <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
          <div className="mt-6 flex justify-center">
            <BackButton />
          </div>
        </div>
        <FooterDashboard />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavbarDashboard />
        <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
          <div className="bg-blue-100 text-blue-700 p-4 rounded-lg mb-6 text-center">
            No se encontró el proyecto.
          </div>
          <div className="mt-6 flex justify-center">
            <BackButton />
          </div>
        </div>
        <FooterDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarDashboard />
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-grill mb-8">
          Detalles del Proyecto
        </h2>
        <div className="w-full max-w-[95%] mx-auto bg-dashboard-background p-6 rounded-lg shadow-md">
          {/* Detalles del proyecto */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-dashboard-text mb-4 text-center">
              <div className="text-dashboard-text flex items-center justify-center">
                <span>
                  <strong>ID:</strong> {project.id}
                </span>
              </div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-dashboard-text flex items-center justify-center space-x-2">
                <span>
                  <strong>Nombre del Cliente:</strong>{" "}
                  {editingField?.field === "clientAlias" ? (
                    <input
                      type="text"
                      value={project.clientAlias}
                      onChange={(e) =>
                        handleProjectChange("clientAlias", e.target.value)
                      }
                      onBlur={stopEditing}
                      autoFocus
                      className="border rounded px-2 py-1 w-40"
                    />
                  ) : (
                    project.clientAlias
                  )}
                </span>
                <button
                  onClick={() => startEditing("clientAlias")}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaPencilAlt size={14} />
                </button>
              </div>
              <div className="text-dashboard-text flex items-center justify-center space-x-2">
                <span>
                  <strong>Contacto:</strong>{" "}
                  {editingField?.field === "contact" ? (
                    <input
                      type="text"
                      value={project.contact}
                      onChange={(e) =>
                        handleProjectChange("contact", e.target.value)
                      }
                      onBlur={stopEditing}
                      autoFocus
                      className="border rounded px-2 py-1 w-40"
                    />
                  ) : (
                    project.contact
                  )}
                </span>
                <button
                  onClick={() => startEditing("contact")}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaPencilAlt size={14} />
                </button>
              </div>
              <div className="text-dashboard-text flex items-center justify-center space-x-2">
                <span>
                  <strong>Estado:</strong>{" "}
                  {editingField?.field === "state" ? (
                    <select
                      value={project.state}
                      onChange={(e) =>
                        handleProjectChange("state", e.target.value === "true")
                      }
                      onBlur={stopEditing}
                      autoFocus
                      className="border rounded px-2 py-1"
                    >
                      <option value="true">En proceso</option>
                      <option value="false">Finalizado</option>
                    </select>
                  ) : project.state ? (
                    "En proceso"
                  ) : (
                    "Finalizado"
                  )}
                </span>
                <button
                  onClick={() => startEditing("state")}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaPencilAlt size={14} />
                </button>
              </div>
              <div className="text-dashboard-text flex items-center justify-center">
                <span>
                  <strong>Fecha de Creación:</strong>{" "}
                  {formatDateOnly(project.createdDate)}
                </span>
              </div>
              <div className="text-dashboard-text flex items-center justify-center space-x-2">
                <span>
                  <strong>Fecha de Visita:</strong>{" "}
                  {editingField?.field === "visitDateTime" ? (
                    <input
                      type="datetime-local"
                      value={
                        project.visitDateTime
                          ? project.visitDateTime.slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        handleProjectChange("visitDateTime", e.target.value)
                      }
                      onBlur={stopEditing}
                      autoFocus
                      className="border rounded px-2 py-1 w-40"
                    />
                  ) : project.visitDateTime ? (
                    formatDateTimeWithoutSeconds(project.visitDateTime)
                  ) : (
                    "N/A"
                  )}
                </span>
                <button
                  onClick={() => startEditing("visitDateTime")}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaPencilAlt size={14} />
                </button>
              </div>
              <div className="text-dashboard-text flex items-center justify-center space-x-2">
                <span>
                  <strong>Fecha de Instalación:</strong>{" "}
                  {editingField?.field === "installationDateTime" ? (
                    <input
                      type="datetime-local"
                      value={
                        project.installationDateTime
                          ? project.installationDateTime.slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        handleProjectChange(
                          "installationDateTime",
                          e.target.value
                        )
                      }
                      onBlur={stopEditing}
                      autoFocus
                      className="border rounded px-2 py-1 w-40"
                    />
                  ) : project.installationDateTime ? (
                    formatDateTimeWithoutSeconds(project.installationDateTime)
                  ) : (
                    "N/A"
                  )}
                </span>
                <button
                  onClick={() => startEditing("installationDateTime")}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaPencilAlt size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Buscador y botón de guardar */}
          <div className="flex justify-center">
            {hasUnsavedChanges && (
              <button
                onClick={saveChanges}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Guardar Actualización
              </button>
            )}
          </div>

          {/* Tabla de piezas */}
          <h3 className="text-lg font-semibold text-dashboard-text mb-4 text-center">
            Piezas
          </h3>
          <div className="flex justify-center mb-4">
            <input
              type="text"
              placeholder="Buscar por ID de pieza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {project.parts?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-dashboard-text text-white">
                    <th
                      className="p-3 text-center cursor-pointer"
                      onClick={() => requestSort("id")}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>ID</span>
                        {sortConfig.key === "id" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          ))}
                      </div>
                    </th>
                    <th className="p-3 text-center">Pieza</th>
                    <th className="p-3 text-center">Material</th>
                    <th
                      className="p-3 text-center cursor-pointer"
                      onClick={() => requestSort("totalweightKg")}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>Peso Total (kg)</span>
                        {sortConfig.key === "totalweightKg" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          ))}
                      </div>
                    </th>
                    <th
                      className="p-3 text-center cursor-pointer"
                      onClick={() => requestSort("sheetThicknessMm")}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>Espesor (mm)</span>
                        {sortConfig.key === "sheetThicknessMm" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          ))}
                      </div>
                    </th>
                    <th
                      className="p-3 text-center cursor-pointer"
                      onClick={() => requestSort("lengthPiecesMm")}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>Largo (mm)</span>
                        {sortConfig.key === "lengthPiecesMm" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          ))}
                      </div>
                    </th>
                    <th
                      className="p-3 text-center cursor-pointer"
                      onClick={() => requestSort("heightMm")}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>Alto (mm)</span>
                        {sortConfig.key === "heightMm" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          ))}
                      </div>
                    </th>
                    <th
                      className="p-3 text-center cursor-pointer"
                      onClick={() => requestSort("widthMm")}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>Ancho (mm)</span>
                        {sortConfig.key === "widthMm" &&
                          (sortConfig.direction === "asc" ? (
                            <FaSortUp />
                          ) : (
                            <FaSortDown />
                          ))}
                      </div>
                    </th>
                    <th className="p-3 text-center">Observaciones</th>
                    <th className="p-3 text-center">Recepción</th>
                    <th className="p-3 text-center">Control de Calidad</th>
                    <th className="p-3 text-center">QR</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedParts.map((part) => (
                    <tr
                      key={part.id}
                      className="border-b border-dashboard-border hover:bg-gray-100 transition-colors"
                    >
                      <td className="p-3 text-center text-dashboard-text">
                        {part.id}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {part.customPart?.customPart || "Sin nombre"}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {part.partMaterial?.materialName || "Sin material"}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {editingField?.field === "totalweightKg" &&
                          editingField?.partId === part.id ? (
                            <input
                              type="number"
                              value={part.totalweightKg || ""}
                              onChange={(e) =>
                                handlePartChange(
                                  part.id,
                                  "totalweightKg",
                                  e.target.value
                                )
                              }
                              onBlur={stopEditing}
                              autoFocus
                              className="border rounded px-2 py-1 w-20 text-center"
                            />
                          ) : (
                            <>
                              <span>{part.totalweightKg || "N/A"}</span>
                              <button
                                onClick={() =>
                                  startEditing("totalweightKg", part.id)
                                }
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <FaPencilAlt size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {editingField?.field === "sheetThicknessMm" &&
                          editingField?.partId === part.id ? (
                            <input
                              type="number"
                              value={part.sheetThicknessMm || ""}
                              onChange={(e) =>
                                handlePartChange(
                                  part.id,
                                  "sheetThicknessMm",
                                  e.target.value
                                )
                              }
                              onBlur={stopEditing}
                              autoFocus
                              className="border rounded px-2 py-1 w-20 text-center"
                            />
                          ) : (
                            <>
                              <span>{part.sheetThicknessMm || "N/A"}</span>
                              <button
                                onClick={() =>
                                  startEditing("sheetThicknessMm", part.id)
                                }
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <FaPencilAlt size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {editingField?.field === "lengthPiecesMm" &&
                          editingField?.partId === part.id ? (
                            <input
                              type="number"
                              value={part.lengthPiecesMm || ""}
                              onChange={(e) =>
                                handlePartChange(
                                  part.id,
                                  "lengthPiecesMm",
                                  e.target.value
                                )
                              }
                              onBlur={stopEditing}
                              autoFocus
                              className="border rounded px-2 py-1 w-20 text-center"
                            />
                          ) : (
                            <>
                              <span>{part.lengthPiecesMm || "N/A"}</span>
                              <button
                                onClick={() =>
                                  startEditing("lengthPiecesMm", part.id)
                                }
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <FaPencilAlt size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {editingField?.field === "heightMm" &&
                          editingField?.partId === part.id ? (
                            <input
                              type="number"
                              value={part.heightMm || ""}
                              onChange={(e) =>
                                handlePartChange(
                                  part.id,
                                  "heightMm",
                                  e.target.value
                                )
                              }
                              onBlur={stopEditing}
                              autoFocus
                              className="border rounded px-2 py-1 w-20 text-center"
                            />
                          ) : (
                            <>
                              <span>{part.heightMm || "N/A"}</span>
                              <button
                                onClick={() =>
                                  startEditing("heightMm", part.id)
                                }
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <FaPencilAlt size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {editingField?.field === "widthMm" &&
                          editingField?.partId === part.id ? (
                            <input
                              type="number"
                              value={part.widthMm || ""}
                              onChange={(e) =>
                                handlePartChange(
                                  part.id,
                                  "widthMm",
                                  e.target.value
                                )
                              }
                              onBlur={stopEditing}
                              autoFocus
                              className="border rounded px-2 py-1 w-20 text-center"
                            />
                          ) : (
                            <>
                              <span>{part.widthMm || "N/A"}</span>
                              <button
                                onClick={() => startEditing("widthMm", part.id)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <FaPencilAlt size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {editingField?.field === "observations" &&
                          editingField?.partId === part.id ? (
                            <input
                              type="text"
                              value={part.observations || ""}
                              onChange={(e) =>
                                handlePartChange(
                                  part.id,
                                  "observations",
                                  e.target.value
                                )
                              }
                              onBlur={stopEditing}
                              autoFocus
                              className="border rounded px-2 py-1 w-32 text-center"
                            />
                          ) : (
                            <>
                              <span>{part.observations || "N/A"}</span>
                              <button
                                onClick={() =>
                                  startEditing("observations", part.id)
                                }
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <FaPencilAlt size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {editingField?.field === "receptionState" &&
                          editingField?.partId === part.id ? (
                            <input
                              type="checkbox"
                              checked={part.receptionState}
                              onChange={(e) =>
                                handlePartChange(
                                  part.id,
                                  "receptionState",
                                  e.target.checked
                                )
                              }
                              onBlur={stopEditing}
                              autoFocus
                            />
                          ) : (
                            <>
                              <span
                                className={
                                  part.receptionState
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {part.receptionState ? "✅" : "❌"}
                              </span>
                              <button
                                onClick={() =>
                                  startEditing("receptionState", part.id)
                                }
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <FaPencilAlt size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {editingField?.field === "qualityControlState" &&
                          editingField?.partId === part.id ? (
                            <input
                              type="checkbox"
                              checked={part.qualityControlState}
                              onChange={(e) =>
                                handlePartChange(
                                  part.id,
                                  "qualityControlState",
                                  e.target.checked
                                )
                              }
                              onBlur={stopEditing}
                              autoFocus
                            />
                          ) : (
                            <>
                              <span
                                className={
                                  part.qualityControlState
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {part.qualityControlState ? "✅" : "❌"}
                              </span>
                              <button
                                onClick={() =>
                                  startEditing("qualityControlState", part.id)
                                }
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <FaPencilAlt size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {part.qrCodeFilePath ? (
                          <>
                            {isLoadingQr[part.qrCodeFilePath] ? (
                              <div className="w-12 h-12 flex items-center justify-center text-gray-600 text-xs bg-gray-100 border border-gray-300 rounded mx-auto">
                                Cargando QR...
                              </div>
                            ) : (
                              <img
                                src={
                                  qrImageUrls[part.qrCodeFilePath] ||
                                  "/placeholder-qr.png"
                                }
                                alt="QR Code"
                                className="w-12 h-12 object-contain border border-gray-300 rounded mx-auto"
                                onError={(e) => {
                                  if (e.target.src !== "/placeholder-qr.png") {
                                    console.warn(
                                      `No se pudo cargar la imagen QR para ${part.qrCodeFilePath}. Usando placeholder.`
                                    );
                                    e.target.src = "/placeholder-qr.png";
                                  }
                                }}
                                onLoad={() => {
                                  console.log(
                                    `Imagen QR cargada correctamente para ${part.qrCodeFilePath}`
                                  );
                                }}
                              />
                            )}
                          </>
                        ) : (
                          <div className="text-dashboard-text text-xs">
                            QR no disponible
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setShowDeleteModal(part.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimes size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-blue-100 text-blue-700 p-4 rounded-lg text-center">
              No hay piezas asociadas a este proyecto.
            </div>
          )}

          {/* Modal de confirmación para eliminar */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Confirmar Eliminación
                </h3>
                <p>¿Estás seguro de que quieres eliminar esta pieza?</p>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => deletePart(showDeleteModal)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón Volver centrado */}
        <div className="mt-8 flex justify-center">
          <BackButton />
        </div>
      </div>
      <FooterDashboard />
    </div>
  );
};

export default ProjectDetail;
