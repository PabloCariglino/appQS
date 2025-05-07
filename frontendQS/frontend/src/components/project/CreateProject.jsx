import axios from "axios";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../auth/AuthService";
import useAuthContext from "../../auth/UseAuthContext";
import CustomPartService from "../../services/CustomPartService";
import PartMaterialService from "../../services/PartMaterialService";
import ProjectService from "../../services/ProjectService";

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
  });

  const [customPartOptions, setCustomPartOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedPieceImageUrl, setSelectedPieceImageUrl] = useState(null);
  const [pieceImageUrls, setPieceImageUrls] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newProjectId, setNewProjectId] = useState(null);
  const navigate = useNavigate();
  const { role } = useAuthContext();

  const basePath = role === "ADMIN" ? "/admin" : "/operator";

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
    const loadPieceImage = async () => {
      if (!newPiece.customPartId) {
        setSelectedPieceImageUrl(null);
        return;
      }

      const selectedPart = customPartOptions.find(
        (part) => part.id.toString() === newPiece.customPartId.toString()
      );
      if (selectedPart && selectedPart.imageFilePath) {
        try {
          const token = getAccessToken();
          if (!token) {
            setError(
              "No estás autenticado. No se puede cargar la imagen de la pieza."
            );
            return;
          }

          const response = await axios.get(
            `http://localhost:8080/image-custom-part/${selectedPart.imageFilePath}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              responseType: "blob",
            }
          );
          const imageUrl = URL.createObjectURL(response.data);
          setSelectedPieceImageUrl(imageUrl);
        } catch (err) {
          console.error(
            `Error al cargar la imagen para la pieza ${selectedPart.id}:`,
            err
          );
          setSelectedPieceImageUrl("/images/placeholder.png");
        }
      } else {
        setSelectedPieceImageUrl(null);
      }
    };

    loadPieceImage();
  }, [newPiece.customPartId, customPartOptions]);

  useEffect(() => {
    const loadPieceImages = async () => {
      const newImageUrls = { ...pieceImageUrls };
      for (const piece of project.pieces) {
        const customPart = customPartOptions.find(
          (p) => p.id.toString() === piece.customPartId.toString()
        );
        if (
          customPart &&
          customPart.imageFilePath &&
          !newImageUrls[piece.customPartId]
        ) {
          try {
            const token = getAccessToken();
            if (!token) {
              setError(
                "No estás autenticado. No se pueden cargar las imágenes de las piezas."
              );
              return;
            }

            const response = await axios.get(
              `http://localhost:8080/image-custom-part/${customPart.imageFilePath}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                responseType: "blob",
              }
            );
            const imageUrl = URL.createObjectURL(response.data);
            newImageUrls[piece.customPartId] = imageUrl;
          } catch (err) {
            console.error(
              `Error al cargar la imagen para la pieza ${ProcurementCustomPart.id}:`,
              err
            );
            newImageUrls[piece.customPartId] = "/images/placeholder.png";
          }
        }
      }
      setPieceImageUrls(newImageUrls);
    };

    if (project.pieces.length > 0) {
      loadPieceImages();
    }
  }, [project.pieces, customPartOptions]);

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
      customPart: {
        id: customPart.id,
        customPartName: customPart.customPartName,
      },
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
      pieces: [...prev.pieces, { ...newPiece }],
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
            customPartName: customPart?.customPartName || "Sin nombre",
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

        setTimeout(() => {
          navigate(`${basePath}/project-list`);
        }, 2000);
      } else {
        setError("Error al crear el proyecto");
      }
    } catch (error) {
      setError("Error al crear el proyecto. Por favor, intenta de nuevo.");
      console.error("Error al crear el proyecto:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow mt-20 px-2 py-2 sm:px-6 sm:py-3 md:px-3 md:py-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-center sm:text-sm md:text-base">
            {error}
          </div>
        )}
        <div className="w-full max-w-[98%] sm:max-w-[96%] mx-auto border border-gray-200 rounded-xl shadow-lg p-6 bg-white">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-red-600 mb-6">
            Crear Proyecto
          </h2>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
              <div className="w-full md:w-[43%]">
                <div className="mb-4">
                  <label className="block text-gray-800 font-medium mb-2">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={project.clientAlias}
                    onChange={(e) =>
                      setProject({ ...project, clientAlias: e.target.value })
                    }
                    required
                    className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-800 font-medium mb-2">
                    Contacto
                  </label>
                  <input
                    type="text"
                    value={project.contact}
                    onChange={(e) =>
                      setProject({ ...project, contact: e.target.value })
                    }
                    required
                    className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
                  />
                </div>
              </div>
              <div className="w-full md:w-[43%]">
                <div className="mb-4">
                  <label className="block text-gray-800 font-medium mb-2">
                    Fecha de Visita
                  </label>
                  <input
                    type="datetime-local"
                    value={project.visitDateTime}
                    onChange={(e) =>
                      setProject({ ...project, visitDateTime: e.target.value })
                    }
                    required
                    step="300" // 5 minutes (300 seconds)
                    className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-800 font-medium mb-2">
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
                    step="300" // 5 minutes (300 seconds)
                    className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[calc(100vh-25rem)] md:max-h-[calc(100vh-37rem)] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-600 text-white sticky top-0 z-10">
                    <th className="p-1 text-center sm:p-1 md:p-1">Pieza</th>
                    <th className="p-1 text-center sm:p-1 md:p-1">
                      Imagen Pieza
                    </th>
                    <th className="p-1 text-center sm:p-2 md:p-3">Material</th>
                    <th className="p-1 text-center sm:p-2 md:p-3">
                      Peso Total (kg)
                    </th>
                    <th className="p-1 text-center sm:p-2 md:p-3">
                      Espesor (mm)
                    </th>
                    <th className="p-1 text-center sm:p-2 md:p-3">
                      Largo (mm)
                    </th>
                    <th className="p-1 text-center sm:p-2 md:p-3">Alto (mm)</th>
                    <th className="p-1 text-center sm:p-2 md:p-3">
                      Ancho (mm)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {project.pieces.map((piece, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <td className="p-3 text-center text-gray-800 sm:p-2 md:p-3 sm:text-sm md:text-base">
                        {customPartOptions.find(
                          (p) =>
                            p.id.toString() === piece.customPartId.toString()
                        )?.customPartName || "No definido"}
                      </td>
                      <td className="p-3 text-center sm:p-2 md:p-3">
                        {pieceImageUrls[piece.customPartId] ? (
                          <img
                            src={pieceImageUrls[piece.customPartId]}
                            alt="Imagen de la pieza"
                            className="w-12 h-12 object-cover rounded mx-auto"
                          />
                        ) : (
                          <span className="text-gray-800 text-xs">
                            Sin imagen
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center text-gray-800 sm:p-2 md:p-3 sm:text-sm md:text-base">
                        {materialOptions.find(
                          (m) =>
                            m.id.toString() === piece.partMaterialId.toString()
                        )?.materialName || "No definido"}
                      </td>
                      <td className="p-3 text-center text-gray-800 sm:p-2 md:p-3 sm:text-sm md:text-base">
                        {piece.totalweightKg}
                      </td>
                      <td className="p-3 text-center text-gray-800 sm:p-2 md:p-3 sm:text-sm md:text-base">
                        {piece.sheetThicknessMm}
                      </td>
                      <td className="p-3 text-center text-gray-800 sm:p-2 md:p-3 sm:text-sm md:text-base">
                        {piece.lengthPiecesMm}
                      </td>
                      <td className="p-3 text-center text-gray-800 sm:p-2 md:p-3 sm:text-sm md:text-base">
                        {piece.heightMm}
                      </td>
                      <td className="p-3 text-center text-gray-800 sm:p-2 md:p-3 sm:text-sm md:text-base">
                        {piece.widthMm}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="p-3 text-center sm:p-2 md:p-3">
                      <select
                        value={newPiece.customPartId}
                        onChange={(e) =>
                          setNewPiece({
                            ...newPiece,
                            customPartId: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
                      >
                        <option value="">Seleccionar</option>
                        {customPartOptions.map((part) => (
                          <option key={part.id} value={part.id}>
                            {part.customPartName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-center sm:p-2 md:p-3">
                      {selectedPieceImageUrl ? (
                        <img
                          src={selectedPieceImageUrl}
                          alt="Imagen de la pieza seleccionada"
                          className="w-12 h-12 object-cover rounded mx-auto"
                        />
                      ) : (
                        <span className="text-gray-800 text-xs">
                          Sin imagen
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center sm:p-2 md:p-3">
                      <select
                        value={newPiece.partMaterialId}
                        onChange={(e) =>
                          setNewPiece({
                            ...newPiece,
                            partMaterialId: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
                      >
                        <option value="">Seleccionar</option>
                        {materialOptions.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.materialName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-center sm:p-2 md:p-3">
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
                        className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
                      />
                    </td>
                    <td className="p-3 text-center sm:p-2 md:p-3">
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
                        className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
                      />
                    </td>
                    <td className="p-3 text-center sm:p-2 md:p-3">
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
                        className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
                      />
                    </td>
                    <td className="p-3 text-center sm:p-2 md:p-3">
                      <input
                        type="number"
                        value={newPiece.heightMm}
                        onChange={(e) =>
                          setNewPiece({ ...newPiece, heightMm: e.target.value })
                        }
                        placeholder="Alto (mm)"
                        className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
                      />
                    </td>
                    <td className="p-3 text-center sm:p-2 md:p-3">
                      <input
                        type="number"
                        value={newPiece.widthMm}
                        onChange={(e) =>
                          setNewPiece({ ...newPiece, widthMm: e.target.value })
                        }
                        placeholder="Ancho (mm)"
                        className="w-full p-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 sm:text-sm md:text-base"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center gap-1 mb-4 mt-4">
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm md:text-base sm:px-3 md:px-4"
                  onClick={handleAddPiece}
                >
                  <FaPlus className="text-sm sm:text-base" />
                  Agregar Pieza
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 sm:text-sm sm:px-3 md:text-base md:px-4"
                  onClick={handleDuplicateLastPiece}
                >
                  Duplicar Última Pieza
                </button>
              </div>
            </div>

            <div className="text-center mt-5">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 sm:text-sm md:text-base sm:px-3 md:px-4 mx-auto"
              >
                <FaPlus className="text-sm sm:text-base" />
                Crear Proyecto
              </button>
            </div>
          </form>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center animate-fade-in">
              <h3 className="text-2xl font-bold text-grill mb-4">
                ¡Proyecto Creado con Éxito!
              </h3>

              <p className="text-gray-500 text-sm">
                Serás redirigido en segundos...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateProject;
