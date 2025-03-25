import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import CustomPartService from "../../services/CustomPartService";
import PartMaterialService from "../../services/PartMaterialService";
import ProjectService from "../../services/ProjectService";
import BackButton from "../BackButton";
import FooterDashboard from "./../FooterDashboard";
import NavbarDashboard from "./../NavbarDashboard";

function CreateProject() {
  const [project, setProject] = useState({
    clientAlias: "",
    contact: "",
    state: true,
    visitDateTime: "",
    installationDateTime: "",
    pieces: [],
  });

  const [newPiece, setNewPiece] = useState({
    customPartId: "",
    partMaterialId: "",
    totalweightKg: "",
    sheetThicknessMm: "",
    lengthPiecesMm: "",
    heightMm: "",
    widthMm: "",
    observations: "",
    qrCodeFilePath: "",
  });

  const [customPartOptions, setCustomPartOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [error, setError] = useState(null);
  const [qrImageUrls, setQrImageUrls] = useState({});
  const [isLoadingQr, setIsLoadingQr] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newProjectId, setNewProjectId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [customParts, materials] = await Promise.all([
          CustomPartService.fetchCustomParts(),
          PartMaterialService.fetchPartMaterials(),
        ]);
        setCustomPartOptions(customParts);
        setMaterialOptions(materials);
      } catch (error) {
        setError("Error al cargar las opciones de piezas y materiales.");
        console.error("Error fetching options:", error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const loadQrImages = async () => {
      const newLoadingState = {};
      const newUrls = {};
      for (const piece of project.pieces) {
        if (piece.qrCodeFilePath) {
          newLoadingState[piece.qrCodeFilePath] = true;
        }
      }
      setIsLoadingQr(newLoadingState);

      for (const piece of project.pieces) {
        if (piece.qrCodeFilePath) {
          try {
            const url = await getQRCodeImage(piece.qrCodeFilePath);
            newUrls[piece.qrCodeFilePath] = url || "/placeholder-qr.png";
            console.log(`URL generada para ${piece.qrCodeFilePath}:`, url);
          } catch (err) {
            console.error(
              `Error al cargar QR para ${piece.qrCodeFilePath}:`,
              err
            );
            newUrls[piece.qrCodeFilePath] = "/placeholder-qr.png";
          }
          newLoadingState[piece.qrCodeFilePath] = false;
        }
      }
      setQrImageUrls(newUrls);
      setIsLoadingQr((prev) => ({ ...prev, ...newLoadingState }));
    };
    if (project.pieces.some((piece) => piece.qrCodeFilePath)) {
      loadQrImages();
    }
  }, [project.pieces]);

  const getQRCodeImage = async (filename) => {
    try {
      const token = getAccessToken();
      if (!token) {
        console.error("No hay token JWT disponible");
        return null;
      }
      const cleanFilename =
        filename.split("\\").pop() || filename.split("/").pop() || filename;
      console.log(
        "Solicitando QR con token:",
        token,
        "para archivo:",
        cleanFilename
      );
      const response = await fetch(
        `http://localhost:8080/qr-codes/${cleanFilename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status} - ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      console.log("URL generada exitosamente:", url);
      return url;
    } catch (error) {
      console.error("Error al obtener la imagen del QR:", error);
      return null;
    }
  };

  const handleAddPiece = async () => {
    if (!newPiece.customPartId || !newPiece.partMaterialId) {
      alert("Por favor, seleccione una pieza y un material.");
      return;
    }

    const customPart = customPartOptions.find(
      (p) => p.id.toString() === newPiece.customPartId.toString()
    );
    const partMaterial = materialOptions.find(
      (m) => m.id.toString() === newPiece.partMaterialId.toString()
    );

    if (!customPart || !partMaterial) {
      alert("La pieza o el material seleccionado no es válido.");
      return;
    }

    const partDto = {
      customPart: { id: customPart.id, customPart: customPart.customPart },
      partMaterial: {
        id: partMaterial.id,
        materialName: partMaterial.materialName,
      },
      totalweightKg: parseFloat(newPiece.totalweightKg),
      sheetThicknessMm: parseFloat(newPiece.sheetThicknessMm),
      lengthPiecesMm: parseFloat(newPiece.lengthPiecesMm),
      heightMm: parseFloat(newPiece.heightMm),
      widthMm: parseFloat(newPiece.widthMm),
      observations: newPiece.observations,
    };

    setProject((prev) => ({
      ...prev,
      pieces: [...prev.pieces, { ...newPiece, qrCodeFilePath: "" }],
    }));

    setNewPiece({
      customPartId: "",
      partMaterialId: "",
      totalweightKg: "",
      sheetThicknessMm: "",
      lengthPiecesMm: "",
      heightMm: "",
      widthMm: "",
      observations: "",
      qrCodeFilePath: "",
    });
  };

  const handleDuplicateLastPiece = () => {
    if (project.pieces.length === 0) {
      alert("No hay piezas para duplicar.");
      return;
    }

    const lastPiece = project.pieces[project.pieces.length - 1];

    setNewPiece({
      customPartId: lastPiece.customPartId,
      partMaterialId: lastPiece.partMaterialId,
      totalweightKg: lastPiece.totalweightKg,
      sheetThicknessMm: lastPiece.sheetThicknessMm,
      lengthPiecesMm: lastPiece.lengthPiecesMm,
      heightMm: lastPiece.heightMm,
      widthMm: lastPiece.widthMm,
      observations: lastPiece.observations,
      qrCodeFilePath: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !project.clientAlias ||
      !project.contact ||
      !project.visitDateTime ||
      !project.installationDateTime
    ) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    try {
      const projectDto = {
        clientAlias: project.clientAlias,
        contact: project.contact,
        state: project.state,
        visitDateTime: project.visitDateTime,
        installationDateTime: project.installationDateTime,
      };

      const partDtos = project.pieces.map((piece) => {
        const customPart = customPartOptions.find(
          (p) => p.id.toString() === piece.customPartId.toString()
        );
        const partMaterial = materialOptions.find(
          (m) => m.id.toString() === piece.partMaterialId.toString()
        );

        return {
          customPart: {
            id: piece.customPartId,
            customPart: customPart?.customPart || "Sin nombre",
          },
          partMaterial: {
            id: piece.partMaterialId,
            materialName: partMaterial?.materialName || "Sin material",
          },
          totalweightKg: parseFloat(piece.totalweightKg),
          sheetThicknessMm: parseFloat(piece.sheetThicknessMm),
          lengthPiecesMm: parseFloat(piece.lengthPiecesMm),
          heightMm: parseFloat(piece.heightMm),
          widthMm: parseFloat(piece.widthMm),
          observations: piece.observations,
        };
      });

      const response = await ProjectService.createNewProject(
        projectDto,
        partDtos
      );
      if (response.success) {
        setNewProjectId(response.data.id);
        setShowModal(true);
        setProject({
          clientAlias: "",
          contact: "",
          state: true,
          visitDateTime: "",
          installationDateTime: "",
          pieces: response.data.parts.map((part) => ({
            ...part,
            customPartId: part.customPart.id,
            partMaterialId: part.partMaterial.id,
          })),
        });
        setQrImageUrls({});

        setTimeout(() => {
          navigate("/project-list");
        }, 5000);
      } else {
        setError("Error al crear el proyecto");
      }
    } catch (error) {
      setError("Error al crear el proyecto. Por favor, intenta de nuevo.");
      console.error("Error al crear el proyecto:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarDashboard />
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-grill mb-6">
          Crear Proyecto
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center max-w-md mx-auto">
            {error}
          </div>
        )}
        <div className="w-full max-w-[95%] mx-auto bg-dashboard-background p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="w-full">
            {/* Campos del proyecto - Diseño en dos columnas */}
            <div className="flex flex-col md:flex-row justify-between gap-5 mb-5">
              <div className="w-full md:w-[48%]">
                <div className="mb-4">
                  <label className="block text-dashboard-text font-medium mb-2">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={project.clientAlias}
                    onChange={(e) =>
                      setProject({ ...project, clientAlias: e.target.value })
                    }
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-dashboard-text font-medium mb-2">
                    Contacto
                  </label>
                  <input
                    type="text"
                    value={project.contact}
                    onChange={(e) =>
                      setProject({ ...project, contact: e.target.value })
                    }
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                  />
                </div>
              </div>
              <div className="w-full md:w-[48%]">
                <div className="mb-4">
                  <label className="block text-dashboard-text font-medium mb-2">
                    Fecha de Visita
                  </label>
                  <input
                    type="datetime-local"
                    value={project.visitDateTime}
                    onChange={(e) =>
                      setProject({ ...project, visitDateTime: e.target.value })
                    }
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-dashboard-text font-medium mb-2">
                    Fecha de Instalación Estimada
                  </label>
                  <input
                    type="datetime-local"
                    value={project.installationDateTime}
                    onChange={(e) =>
                      setProject({
                        ...project,
                        installationDateTime: e.target.value,
                      })
                    }
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                  />
                </div>
              </div>
            </div>

            {/* Tabla de piezas */}
            <h3 className="text-lg font-semibold text-dashboard-text mb-4">
              Piezas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-dashboard-text text-white">
                    <th className="p-3 text-center">Pieza</th>
                    <th className="p-3 text-center">Material</th>
                    <th className="p-3 text-center">Peso Total (kg)</th>
                    <th className="p-3 text-center">Espesor (mm)</th>
                    <th className="p-3 text-center">Largo (mm)</th>
                    <th className="p-3 text-center">Alto (mm)</th>
                    <th className="p-3 text-center">Ancho (mm)</th>
                    <th className="p-3 text-center">QR</th>
                  </tr>
                </thead>
                <tbody>
                  {project.pieces.map((piece, index) => (
                    <tr
                      key={index}
                      className="border-b border-dashboard-border hover:bg-gray-100 transition-colors"
                    >
                      <td className="p-3 text-center text-dashboard-text">
                        {customPartOptions.find(
                          (p) =>
                            p.id.toString() === piece.customPartId.toString()
                        )?.customPart || "No definido"}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {materialOptions.find(
                          (m) =>
                            m.id.toString() === piece.partMaterialId.toString()
                        )?.materialName || "No definido"}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {piece.totalweightKg}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {piece.sheetThicknessMm}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {piece.lengthPiecesMm}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {piece.heightMm}
                      </td>
                      <td className="p-3 text-center text-dashboard-text">
                        {piece.widthMm}
                      </td>
                      <td className="p-3 text-center">
                        {piece.qrCodeFilePath ? (
                          <>
                            <img
                              src={
                                qrImageUrls[piece.qrCodeFilePath] ||
                                "/placeholder-qr.png"
                              }
                              alt="QR Code"
                              className="w-12 h-12 object-contain border border-gray-300 rounded mx-auto"
                              style={{
                                display: isLoadingQr[piece.qrCodeFilePath]
                                  ? "none"
                                  : "block",
                              }}
                              onError={(e) => {
                                e.target.src = "/placeholder-qr.png";
                                console.error(
                                  "Error al cargar QR para:",
                                  piece.qrCodeFilePath,
                                  e
                                );
                              }}
                            />
                            {isLoadingQr[piece.qrCodeFilePath] && (
                              <div className="w-12 h-12 flex items-center justify-center text-gray-600 text-xs bg-gray-100 border border-gray-300 rounded mx-auto">
                                Cargando QR...
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-dashboard-text text-xs">
                            QR no generado (crear proyecto para generar)
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="p-3 text-center">
                      <select
                        value={newPiece.customPartId}
                        onChange={(e) =>
                          setNewPiece({
                            ...newPiece,
                            customPartId: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                      >
                        <option value="">Seleccionar</option>
                        {customPartOptions.map((part) => (
                          <option key={part.id} value={part.id}>
                            {part.customPart}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={newPiece.partMaterialId}
                        onChange={(e) =>
                          setNewPiece({
                            ...newPiece,
                            partMaterialId: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                      >
                        <option value="">Seleccionar</option>
                        {materialOptions.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.materialName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={newPiece.totalweightKg}
                        onChange={(e) =>
                          setNewPiece({
                            ...newPiece,
                            totalweightKg: e.target.value,
                          })
                        }
                        placeholder="Peso Total (kg)"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={newPiece.sheetThicknessMm}
                        onChange={(e) =>
                          setNewPiece({
                            ...newPiece,
                            sheetThicknessMm: e.target.value,
                          })
                        }
                        placeholder="Espesor (mm)"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={newPiece.lengthPiecesMm}
                        onChange={(e) =>
                          setNewPiece({
                            ...newPiece,
                            lengthPiecesMm: e.target.value,
                          })
                        }
                        placeholder="Largo (mm)"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={newPiece.heightMm}
                        onChange={(e) =>
                          setNewPiece({ ...newPiece, heightMm: e.target.value })
                        }
                        placeholder="Alto (mm)"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={newPiece.widthMm}
                        onChange={(e) =>
                          setNewPiece({ ...newPiece, widthMm: e.target.value })
                        }
                        placeholder="Ancho (mm)"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                      />
                    </td>
                    <td className="p-3 text-center"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Botones centrados para piezas */}
            <div className="flex flex-col items-center gap-3 mb-5">
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <button
                  type="button"
                  className="bg-grill hover:bg-grill-dark text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                  onClick={handleAddPiece}
                >
                  Agregar Pieza
                </button>
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                  onClick={handleDuplicateLastPiece}
                >
                  Duplicar Última Pieza
                </button>
              </div>
            </div>

            {/* Botón Crear Proyecto */}
            <div className="text-center mt-5">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                Crear Proyecto
              </button>
            </div>
          </form>
        </div>

        {/* Modal animado */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center animate-fade-in">
              <h3 className="text-2xl font-bold text-grill mb-4">
                ¡Proyecto Creado con Éxito!
              </h3>
              <p className="text-dashboard-text mb-4">
                El proyecto ha sido creado con el ID:{" "}
                <strong>{newProjectId}</strong>
              </p>
              <p className="text-gray-500 text-sm">
                Serás redirigido en 5 segundos...
              </p>
            </div>
          </div>
        )}

        {/* Botón Volver centrado */}
        <div className="mt-6 flex justify-center">
          <BackButton />
        </div>
      </div>
      <FooterDashboard />
    </div>
  );
}

export default CreateProject;
