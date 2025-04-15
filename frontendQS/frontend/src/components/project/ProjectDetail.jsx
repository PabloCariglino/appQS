//ProjectDetail.jsx
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { FaPencilAlt, FaPrint, FaSortDown, FaSortUp } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { AuthContext } from "../../auth/AuthContext";
import { getAccessToken } from "../../auth/AuthService";
import PartService from "../../services/PartService";
import ProjectService from "../../services/ProjectService";
import QrCodeService from "../../services/QrCodeService";
import BackButton from "../BackButton";
import FooterDashboard from "./../FooterDashboard";
import NavbarDashboard from "./../NavbarDashboard";
import QRPrintTemplate from "./QRPrintTemplate";

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

// Enum para los estados de la pieza (mapeado desde el backend)
const PartStateOptions = [
  "DESARROLLO",
  "EN_PRODUCCION",
  "CONTROL_CALIDAD_EN_FABRICA",
  "SOLDADO_FLAPEADO",
  "FOFATIZADO_LIJADO",
  "PINTADO",
  "EMBALADO",
  "INSTALACION_DOMICILIO",
  "INSTALADO_EXITOSO",
  "FALTANTE",
  "DEVOLUCION_FUERA_DE_MEDIDA",
  "REPINTANDO_POR_GOLPE_O_RAYON",
  "REPARACION",
];

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useContext(AuthContext); // Obtener el rol del usuario
  const [project, setProject] = useState(null);
  const [originalProject, setOriginalProject] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrImageUrls, setQrImageUrls] = useState({});
  const [partImageUrls, setPartImageUrls] = useState({});
  const [isLoadingQr, setIsLoadingQr] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedPartsToPrint, setSelectedPartsToPrint] = useState([]);
  const [isQrLoaded, setIsQrLoaded] = useState(false);
  const printRef = useRef();

  const isAdmin = role === "ADMIN"; // Determinar si el usuario es ADMIN

  // Manejar la impresión con react-to-print
  const handlePrint = useReactToPrint({
    content: () => {
      console.log("Accediendo a printRef.current:", printRef.current);
      if (!printRef.current) {
        console.error("printRef.current es null");
        throw new Error("No se encontró el contenido para imprimir.");
      }
      return printRef.current;
    },
    documentTitle: `QR_Piezas_Proyecto_${project?.id || "unknown"}`,
    onBeforeGetContent: () => {
      console.log("Preparando contenido para impresión...");
      console.log("Piezas seleccionadas:", selectedPartsToPrint);
      console.log("Estado de project:", project);
      if (!selectedPartsToPrint || selectedPartsToPrint.length === 0) {
        console.error("No hay piezas seleccionadas para imprimir.");
        throw new Error("No hay piezas seleccionadas para imprimir.");
      }
      if (!project || !project.parts) {
        console.error("Project o project.parts no están definidos.");
        throw new Error("No hay datos de proyecto disponibles para imprimir.");
      }
      return Promise.resolve();
    },
    onAfterPrint: () => {
      console.log("Impresión completada.");
      setSelectedPartsToPrint([]); // Limpiar selección después de imprimir
      setShowPrintModal(false); // Cerrar el modal después de imprimir
    },
    onPrintError: (errorLocation, error) => {
      console.error("Error al intentar imprimir:", errorLocation, error);
      setError("Error al intentar imprimir. Por favor, intenta nuevamente.");
    },
  });

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
      if (!project || !project.parts || project.parts.length === 0) {
        console.log("Proyecto o partes no disponibles para cargar QRs.");
        setIsQrLoaded(true);
        return;
      }

      const newLoadingState = {};
      const newUrls = {};
      let shouldRedirect = false;

      console.log("Partes del proyecto:", project.parts);

      for (const part of project.parts) {
        if (part.qrCodeFilePath) {
          newLoadingState[part.qrCodeFilePath] = true;
        } else {
          console.warn(`La pieza con ID ${part.id} no tiene qrCodeFilePath.`);
        }
      }
      setIsLoadingQr(newLoadingState);

      for (const part of project.parts) {
        if (part.qrCodeFilePath && !shouldRedirect) {
          try {
            const cleanFilename =
              part.qrCodeFilePath.split(/[\\/]/).pop() || part.qrCodeFilePath;
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
              err.response?.status,
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
        setIsQrLoaded(true);
        console.log("Estado de qrImageUrls actualizado:", newUrls);
      }

      if (shouldRedirect) {
        navigate("/login");
      }
    };

    if (project && project.parts) {
      loadQrImages();
    }

    return () => {
      console.log("Limpiando URLs de QRs...");
      Object.values(qrImageUrls).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      setQrImageUrls({});
    };
  }, [project, navigate]);

  // Cargar las imágenes de las piezas
  useEffect(() => {
    const loadPartImages = async () => {
      if (!project || !project.parts || project.parts.length === 0) return;

      const token = getAccessToken();
      if (!token) {
        setError("No estás autenticado. No se pueden cargar las imágenes.");
        return;
      }

      const imagePromises = project.parts.map(async (part) => {
        if (part.customPart?.imageFilePath) {
          try {
            const response = await axios.get(
              `http://localhost:8080/image-custom-part/${part.customPart.imageFilePath}`,
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
              err.response?.status,
              err.message
            );
            return { id: part.id, url: null }; // Retornar null en caso de error
          }
        }
        return { id: part.id, url: null };
      });

      const images = await Promise.all(imagePromises);
      const imageUrlMap = images.reduce((acc, { id, url }) => {
        if (id && url) {
          acc[id] = url;
        }
        return acc;
      }, {});
      setPartImageUrls(imageUrlMap);
    };

    if (project && project.parts) {
      loadPartImages();
    }

    return () => {
      Object.values(partImageUrls).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      setPartImageUrls({});
    };
  }, [project]);

  // Detectar cambios no guardados
  useEffect(() => {
    if (!project || !originalProject) return;
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
      const failedParts = [];

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
            partState: originalPart.partState,
            scanDateTime: originalPart.scanDateTime,
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
            partState: part.partState,
            scanDateTime: part.scanDateTime,
          });

        if (partChanged) {
          // Actualizar la pieza en el backend
          try {
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
              partState: part.partState,
              scanDateTime: part.scanDateTime,
            });

            if (!partResponse.success) {
              throw new Error(
                `Error al actualizar la pieza ${part.id}: ${partResponse.message}`
              );
            }
          } catch (err) {
            console.error(`Error al actualizar la pieza ${part.id}:`, err);
            failedParts.push({ id: part.id, error: err.message });
            updatedParts.push(part);
            continue;
          }
        }

        if (projectChanged || partChanged) {
          // Solo eliminar y regenerar el QR si el usuario es ADMIN
          if (isAdmin) {
            // Eliminar el QR existente si existe
            if (part.qrCodeFilePath) {
              try {
                const qrCodeId = part.qrCodeFilePath.split("_part_qr.png")[0];
                const qrDeleteResponse = await QrCodeService.deleteQRCode(
                  qrCodeId
                );
                if (!qrDeleteResponse.success) {
                  throw new Error(
                    `Error al eliminar el QR de la pieza ${part.id}: ${qrDeleteResponse.message}`
                  );
                }
              } catch (err) {
                console.error(
                  `Error al eliminar el QR de la pieza ${part.id}:`,
                  err
                );
                failedParts.push({
                  id: part.id,
                  error: `Error al eliminar QR: ${err.message}`,
                });
                updatedParts.push(part);
                continue;
              }
            }

            // Generar un nuevo QR
            try {
              const qrData = {
                id: part.id,
                project: { id: project.id },
                customPart: part.customPart,
                partMaterial: part.partMaterial,
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
                partState: part.partState,
                scanDateTime: part.scanDateTime,
              };

              const qrResponse = await QrCodeService.generateQRCode(qrData);
              if (qrResponse.success) {
                updatedParts.push({
                  ...part,
                  qrCodeFilePath: qrResponse.data.filePath,
                });
              } else {
                throw new Error(
                  `Error al regenerar el QR de la pieza ${part.id}: ${qrResponse.message}`
                );
              }
            } catch (err) {
              console.error(
                `Error al regenerar el QR de la pieza ${part.id}:`,
                err
              );
              failedParts.push({
                id: part.id,
                error: `Error al generar QR: ${err.message}`,
              });
              updatedParts.push(part);
              continue;
            }
          } else {
            // Si el usuario es OPERATOR, simplemente mantener la pieza sin modificar el QR
            updatedParts.push(part);
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

      if (failedParts.length > 0) {
        const errorMessages = failedParts.map(
          (failed) => `Pieza ${failed.id}: ${failed.error}`
        );
        setError(
          `Algunos cambios no se pudieron guardar:\n${errorMessages.join("\n")}`
        );
      } else {
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error desconocido al guardar los cambios";
      setError(`Error al guardar los cambios: ${errorMessage}`);
      console.error("Error saving changes:", err);
    }
  };

  // Eliminar una pieza
  const deletePart = async (partId) => {
    try {
      const part = project.parts.find((p) => p.id === partId);
      if (part.qrCodeFilePath) {
        const qrCodeId = part.qrCodeFilePath.split("_part_qr.png")[0];
        const qrDeleteResponse = await QrCodeService.deleteQRCode(qrCodeId);
        if (!qrDeleteResponse.success) {
          throw new Error(
            `Error al eliminar el QR de la pieza ${partId}: ${qrDeleteResponse.message}`
          );
        }
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
  const filteredParts =
    project?.parts?.filter((part) =>
      part.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const sortedParts = [...filteredParts].sort((a, b) => {
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

  // Manejar la selección de piezas para imprimir
  const handleSelectPartToPrint = (partId) => {
    setSelectedPartsToPrint((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId]
    );
  };

  const handleSelectAllPartsToPrint = () => {
    if (!project?.parts) return;
    if (selectedPartsToPrint.length === project.parts.length) {
      setSelectedPartsToPrint([]);
    } else {
      setSelectedPartsToPrint(project.parts.map((part) => part.id));
    }
  };

  const handlePrintSelected = () => {
    console.log("Iniciando handlePrintSelected...");
    console.log("Piezas seleccionadas:", selectedPartsToPrint);
    console.log("Estado de project:", project);
    console.log("Estado de isQrLoaded:", isQrLoaded);

    // Validar que haya piezas seleccionadas
    if (!selectedPartsToPrint || selectedPartsToPrint.length === 0) {
      alert("Por favor, selecciona al menos una pieza para imprimir.");
      return;
    }

    // Validar que las imágenes QR estén cargadas
    if (!isQrLoaded) {
      alert(
        "Las imágenes QR aún se están cargando. Por favor, espera un momento."
      );
      return;
    }

    // Validar que project y project.parts estén definidos
    if (!project || !project.parts || project.parts.length === 0) {
      alert("No hay datos de proyecto o piezas disponibles para imprimir.");
      return;
    }

    // Validar que el contenido a imprimir exista
    const partsToPrint = project.parts.filter((part) =>
      selectedPartsToPrint.includes(part.id)
    );
    if (!partsToPrint || partsToPrint.length === 0) {
      alert("No se encontraron piezas seleccionadas para imprimir.");
      return;
    }

    // Proceder con la impresión
    try {
      console.log("Llamando a handlePrint...");
      handlePrint();
    } catch (err) {
      console.error("Error al intentar imprimir:", err);
      setError("Error al intentar imprimir. Por favor, intenta nuevamente.");
    }
  };

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
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center whitespace-pre-line">
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
        <h2
          className={`text-center text-3xl md:text-4xl font-bold mb-8 ${
            isAdmin ? "text-grill" : "text-blue-800"
          }`}
        >
          Detalles del Proyecto
        </h2>
        <div
          className={`w-full max-w-[95%] mx-auto p-6 rounded-lg shadow-md ${
            isAdmin ? "bg-dashboard-background" : "bg-gray-50"
          }`}
        >
          {/* Detalles del proyecto */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-dashboard-text mb-4 text-center">
              <div className="text-dashboard-text flex items-center justify-center">
                <span>
                  <strong>ID:</strong> {project.id}
                </span>
              </div>
            </h3>
            <div
              className={`grid gap-6 ${
                isAdmin
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {isAdmin && (
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
              )}
              {isAdmin && (
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
              )}
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
                {isAdmin && (
                  <button
                    onClick={() => startEditing("state")}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaPencilAlt size={14} />
                  </button>
                )}
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
                {isAdmin && (
                  <button
                    onClick={() => startEditing("visitDateTime")}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaPencilAlt size={14} />
                  </button>
                )}
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
                {isAdmin && (
                  <button
                    onClick={() => startEditing("installationDateTime")}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaPencilAlt size={14} />
                  </button>
                )}
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

          {/* Modal de éxito animado */}
          <AnimatePresence>
            {showSuccessModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <motion.div
                  className="bg-green-500 text-white p-6 rounded-lg shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold">
                    Cambios guardados exitosamente
                  </h3>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

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
                  <tr
                    className={
                      isAdmin
                        ? "bg-dashboard-text text-white"
                        : "bg-gray-600 text-white"
                    }
                  >
                    <th
                      className="p-3 text-center cursor-pointer w-20"
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
                    <th className="p-3 text-center">Imagen Pieza</th>
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
                    <th className="p-3 text-center">Recepción</th>
                    <th className="p-3 text-center">
                      Fecha y Hora de Recepción
                    </th>
                    <th className="p-3 text-center">Estado de Pieza</th>
                    <th className="p-3 text-center">Control de Calidad</th>
                    {isAdmin && (
                      <th className="p-3 text-center">
                        <div className="flex flex-col items-center">
                          <span>QR</span>
                          <button
                            onClick={() => setShowPrintModal(true)}
                            className="mt-2 text-white hover:text-gray-200"
                          >
                            <FaPrint size={14} />
                          </button>
                        </div>
                      </th>
                    )}
                    <th className="p-3 text-center">Observaciones</th>
                    {isAdmin && <th className="p-3 text-center">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedParts.map((part) => (
                    <tr
                      key={part.id}
                      className="border-b border-dashboard-border hover:bg-gray-100 transition-colors"
                    >
                      <td className="p-3 text-center text-dashboard-text w-20">
                        {part.id}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {part.customPart?.customPartName || "Sin nombre"}
                      </td>
                      <td className="p-3 text-center">
                        {part.customPart?.imageFilePath &&
                        partImageUrls[part.id] ? (
                          <img
                            src={partImageUrls[part.id]}
                            alt={part.customPart.customPartName || "Pieza"}
                            className="w-16 h-auto mx-auto"
                          />
                        ) : (
                          <span className="text-dashboard-text">
                            Sin imagen
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {part.partMaterial?.materialName || "Sin material"}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {isAdmin &&
                          editingField?.field === "totalweightKg" &&
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
                              {isAdmin && (
                                <button
                                  onClick={() =>
                                    startEditing("totalweightKg", part.id)
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <FaPencilAlt size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {isAdmin &&
                          editingField?.field === "sheetThicknessMm" &&
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
                              {isAdmin && (
                                <button
                                  onClick={() =>
                                    startEditing("sheetThicknessMm", part.id)
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <FaPencilAlt size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {isAdmin &&
                          editingField?.field === "lengthPiecesMm" &&
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
                              {isAdmin && (
                                <button
                                  onClick={() =>
                                    startEditing("lengthPiecesMm", part.id)
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <FaPencilAlt size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {isAdmin &&
                          editingField?.field === "heightMm" &&
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
                              {isAdmin && (
                                <button
                                  onClick={() =>
                                    startEditing("heightMm", part.id)
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <FaPencilAlt size={14} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {isAdmin &&
                          editingField?.field === "widthMm" &&
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
                              {isAdmin && (
                                <button
                                  onClick={() =>
                                    startEditing("widthMm", part.id)
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <FaPencilAlt size={14} />
                                </button>
                              )}
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
                        {part.scanDateTime
                          ? formatDateTimeWithoutSeconds(part.scanDateTime)
                          : "N/A"}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        <div className="flex items-center justify-center space-x-2">
                          {editingField?.field === "partState" &&
                          editingField?.partId === part.id ? (
                            <select
                              value={part.partState || ""}
                              onChange={(e) =>
                                handlePartChange(
                                  part.id,
                                  "partState",
                                  e.target.value
                                )
                              }
                              onBlur={stopEditing}
                              autoFocus
                              className="border rounded px-2 py-1 w-40 text-center"
                            >
                              <option value="">Seleccionar estado</option>
                              {PartStateOptions.map((state) => (
                                <option key={state} value={state}>
                                  {state.replace(/_/g, " ")}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <>
                              <span>
                                {part.partState
                                  ? part.partState.replace(/_/g, " ")
                                  : "N/A"}
                              </span>
                              <button
                                onClick={() =>
                                  startEditing("partState", part.id)
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
                      {isAdmin && (
                        <td className="p-3 text-center">
                          {part.qrCodeFilePath ? (
                            <>
                              {isLoadingQr[part.qrCodeFilePath] ? (
                                <div className="w-12 h-12 flex items-center justify-center text-gray-600 text-xs bg-gray-100 border border-gray-300 rounded mx-auto">
                                  Cargando QR...
                                </div>
                              ) : qrImageUrls[part.qrCodeFilePath] ? (
                                <img
                                  src={qrImageUrls[part.qrCodeFilePath]}
                                  alt="QR Code"
                                  className="w-12 h-12 object-contain border border-gray-300 rounded mx-auto"
                                  onError={(e) => {
                                    console.warn(
                                      `No se pudo cargar la imagen QR para ${part.qrCodeFilePath}. Usando placeholder.`
                                    );
                                    e.target.src = "/placeholder-qr.png";
                                  }}
                                  onLoad={() => {
                                    console.log(
                                      `Imagen QR cargada correctamente para ${part.qrCodeFilePath}`
                                    );
                                  }}
                                />
                              ) : (
                                <div className="text-dashboard-text text-xs">
                                  QR no disponible
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-dashboard-text text-xs">
                              QR no disponible
                            </div>
                          )}
                        </td>
                      )}
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
                      {isAdmin && (
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setShowDeleteModal(part.id)}
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
          ) : (
            <div className="bg-blue-100 text-blue-700 p-4 rounded-lg text-center">
              No hay piezas asociadas a este proyecto.
            </div>
          )}

          {/* Modal de selección de QR para imprimir (solo para ADMIN) */}
          {isAdmin && showPrintModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h3 className="text-lg font-semibold mb-4">
                  Seleccionar QR para imprimir
                </h3>
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={
                        project?.parts &&
                        selectedPartsToPrint.length === project.parts.length
                      }
                      onChange={handleSelectAllPartsToPrint}
                    />
                    <span>Seleccionar todos</span>
                  </label>
                </div>
                <div className="max-h-60 overflow-y-auto mb-4">
                  {project.parts.map((part) => (
                    <label
                      key={part.id}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPartsToPrint.includes(part.id)}
                        onChange={() => handleSelectPartToPrint(part.id)}
                      />
                      <span>
                        {part.customPart?.customPartName || "Sin nombre"} (ID:{" "}
                        {part.id})
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowPrintModal(false);
                      setSelectedPartsToPrint([]);
                    }}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handlePrintSelected}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Componente oculto para la impresión */}
          <div style={{ display: "none" }}>
            <div ref={printRef}>
              <QRPrintTemplate
                parts={
                  project?.parts?.filter((part) =>
                    selectedPartsToPrint.includes(part.id)
                  ) || []
                }
                qrImageUrls={qrImageUrls}
                project={project}
              />
            </div>
          </div>

          {/* Modal de confirmación para eliminar (solo para ADMIN) */}
          {isAdmin && showDeleteModal && (
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
