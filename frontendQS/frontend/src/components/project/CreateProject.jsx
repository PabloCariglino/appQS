// CreateProject.jsx
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { getAccessToken } from "../../auth/AuthService"; // Importar getAccessToken
import BackButton from "../../fragments/BackButton";
import CustomPartService from "../../services/customPartService";
import PartMaterialService from "../../services/partMaterialService";
import ProjectService from "../../services/projectService";
import styles from "./CreateProject.module.css";

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
    qrCodeFilePath: "", // QR vacío hasta crear el proyecto
  });

  const [customPartOptions, setCustomPartOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [error, setError] = useState(null);
  const [qrImageUrls, setQrImageUrls] = useState({}); // Estado para almacenar URLs de QR
  const [isLoadingQr, setIsLoadingQr] = useState({}); // Estado por pieza para manejar la carga de QRs

  // Cargar opciones de piezas y materiales
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

  // Cargar imágenes QR asíncronamente después de crear el proyecto
  useEffect(() => {
    const loadQrImages = async () => {
      const newLoadingState = {};
      const newUrls = {};
      for (const piece of project.pieces) {
        if (piece.qrCodeFilePath) {
          newLoadingState[piece.qrCodeFilePath] = true; // Marcamos como cargando
        }
      }
      setIsLoadingQr(newLoadingState);

      for (const piece of project.pieces) {
        if (piece.qrCodeFilePath) {
          try {
            const url = await getQRCodeImage(piece.qrCodeFilePath);
            newUrls[piece.qrCodeFilePath] = url || "/placeholder-qr.png";
            console.log(`URL generada para ${piece.qrCodeFilePath}:`, url); // Depuración
          } catch (err) {
            console.error(
              `Error al cargar QR para ${piece.qrCodeFilePath}:`,
              err
            );
            newUrls[piece.qrCodeFilePath] = "/placeholder-qr.png";
          }
          newLoadingState[piece.qrCodeFilePath] = false; // Marcamos como cargado
        }
      }
      setQrImageUrls(newUrls);
      setIsLoadingQr((prev) => ({ ...prev, ...newLoadingState }));
    };
    if (project.pieces.some((piece) => piece.qrCodeFilePath)) {
      // Solo cargar si hay QRs
      loadQrImages();
    }
  }, [project.pieces]); // Se ejecuta cuando cambian las piezas con QRs

  // Función para obtener la imagen del QR con nombres relativos
  const getQRCodeImage = async (filename) => {
    try {
      const token = getAccessToken();
      if (!token) {
        console.error("No hay token JWT disponible");
        return null;
      }
      // Extraer solo el nombre del archivo si filename es una ruta absoluta
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
      pieces: [...prev.pieces, { ...newPiece, qrCodeFilePath: "" }], // QR vacío hasta crear el proyecto
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
      qrCodeFilePath: "", // QR vacío hasta crear el proyecto
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
        alert("¡Proyecto creado con éxito!");
        const updatedPieces = response.data.parts.map((part) => ({
          ...part,
          customPartId: part.customPart.id,
          partMaterialId: part.partMaterial.id,
        }));
        setProject({
          clientAlias: "",
          contact: "",
          state: true,
          visitDateTime: "",
          installationDateTime: "",
          pieces: updatedPieces,
        });
        setQrImageUrls({}); // Reiniciar las URLs de QRs
      } else {
        setError("Error al crear el proyecto");
      }
    } catch (error) {
      setError("Error al crear el proyecto. Por favor, intenta de nuevo.");
      console.error("Error al crear el proyecto:", error);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>Crear Proyecto</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Campos del proyecto - Diseño en dos columnas */}
          <div className={styles.formRow}>
            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Cliente</label>
                <input
                  type="text"
                  value={project.clientAlias}
                  onChange={(e) =>
                    setProject({ ...project, clientAlias: e.target.value })
                  }
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Contacto</label>
                <input
                  type="text"
                  value={project.contact}
                  onChange={(e) =>
                    setProject({ ...project, contact: e.target.value })
                  }
                  required
                  className={styles.input}
                />
              </div>
            </div>
            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Fecha de Visita</label>
                <input
                  type="datetime-local"
                  value={project.visitDateTime}
                  onChange={(e) =>
                    setProject({ ...project, visitDateTime: e.target.value })
                  }
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>
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
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Tabla de piezas */}
          <h3 className={styles.subtitle}>Piezas</h3>
          <table className={`table ${styles.table}`}>
            <thead>
              <tr>
                <th>Pieza</th>
                <th>Material</th>
                <th>Peso Total (kg)</th>
                <th>Espesor (mm)</th>
                <th>Largo (mm)</th>
                <th>Alto (mm)</th>
                <th>Ancho (mm)</th>
                <th>QR</th>
              </tr>
            </thead>
            <tbody>
              {project.pieces.map((piece, index) => (
                <tr key={index}>
                  <td>
                    {customPartOptions.find(
                      (p) => p.id.toString() === piece.customPartId.toString()
                    )?.customPart || "No definido"}
                  </td>
                  <td>
                    {materialOptions.find(
                      (m) => m.id.toString() === piece.partMaterialId.toString()
                    )?.materialName || "No definido"}
                  </td>
                  <td>{piece.totalweightKg}</td>
                  <td>{piece.sheetThicknessMm}</td>
                  <td>{piece.lengthPiecesMm}</td>
                  <td>{piece.heightMm}</td>
                  <td>{piece.widthMm}</td>
                  <td>
                    {piece.qrCodeFilePath ? (
                      <>
                        <img
                          src={
                            qrImageUrls[piece.qrCodeFilePath] ||
                            "/placeholder-qr.png"
                          }
                          alt="QR Code"
                          width="50"
                          height="50"
                          onError={(e) => {
                            e.target.src = "/placeholder-qr.png";
                            console.error(
                              "Error al cargar QR para:",
                              piece.qrCodeFilePath,
                              e
                            );
                          }}
                          className={styles.qrImage}
                          style={{
                            display: isLoadingQr[piece.qrCodeFilePath]
                              ? "none"
                              : "block",
                          }}
                        />
                        {isLoadingQr[piece.qrCodeFilePath] && (
                          <div className={styles.loading}>Cargando QR...</div>
                        )}
                      </>
                    ) : (
                      <div className={styles.noQr}>
                        QR no generado (crear proyecto para generar)
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <select
                    value={newPiece.customPartId}
                    onChange={(e) =>
                      setNewPiece({ ...newPiece, customPartId: e.target.value })
                    }
                    className={styles.select}
                  >
                    <option value="">Seleccione una pieza</option>
                    {customPartOptions.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.customPart}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={newPiece.partMaterialId}
                    onChange={(e) =>
                      setNewPiece({
                        ...newPiece,
                        partMaterialId: e.target.value,
                      })
                    }
                    className={styles.select}
                  >
                    <option value="">Seleccione un material</option>
                    {materialOptions.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.materialName}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
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
                    className={styles.input}
                  />
                </td>
                <td>
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
                    className={styles.input}
                  />
                </td>
                <td>
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
                    className={styles.input}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={newPiece.heightMm}
                    onChange={(e) =>
                      setNewPiece({ ...newPiece, heightMm: e.target.value })
                    }
                    placeholder="Alto (mm)"
                    className={styles.input}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={newPiece.widthMm}
                    onChange={(e) =>
                      setNewPiece({ ...newPiece, widthMm: e.target.value })
                    }
                    placeholder="Ancho (mm)"
                    className={styles.input}
                  />
                </td>
                <td>
                  {/* Espacio vacío, ya que los botones se movieron arriba */}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Botones centrados para piezas - Formando triángulo invertido */}
          <div className={styles.buttonGroup}>
            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.buttonPrimary}
                onClick={handleAddPiece}
              >
                Agregar Pieza
              </button>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={handleDuplicateLastPiece}
              >
                Duplicar Última Pieza
              </button>
            </div>
          </div>

          <div className={styles.submitButton}>
            <button type="submit" className={styles.buttonSuccess}>
              Crear Proyecto
            </button>
          </div>
        </form>
      </div>
      <BackButton className={styles.backButton} />
    </>
  );
}

export default CreateProject;
