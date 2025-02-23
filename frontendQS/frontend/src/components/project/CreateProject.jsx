// CreateProject.jsx (modificado)
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { getAccessToken } from "../../auth/AuthService"; // Importar getAccessToken
import BackButton from "../../fragments/BackButton";
import CustomPartService from "../../services/CustomPartService";
import PartMaterialService from "../../services/PartMaterialService";
import ProjectService from "../../services/ProjectService";
import QRCodeService from "../../services/QRCodeService";
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
    qrCodeFilePath: "",
  });

  const [customPartOptions, setCustomPartOptions] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);
  const [error, setError] = useState(null);
  const [qrImageUrls, setQrImageUrls] = useState({}); // Estado para almacenar URLs de QR

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

  // Cargar imágenes QR asíncronamente cuando cambian las piezas
  useEffect(() => {
    const loadQrImages = async () => {
      const urls = {};
      for (const piece of project.pieces) {
        if (piece.qrCodeFilePath) {
          const url = await getQRCodeImage(piece.qrCodeFilePath);
          urls[piece.qrCodeFilePath] = url || "/placeholder-qr.png";
        }
      }
      setQrImageUrls(urls);
    };
    loadQrImages();
  }, [project.pieces]); // Se ejecuta cuando cambian las piezas

  // Función para obtener la imagen del QR
  const getQRCodeImage = async (filename) => {
    try {
      const token = getAccessToken(); // Obtener el token JWT
      const response = await fetch(
        `http://localhost:8080/qr-codes/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Incluir el token en el encabezado
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob(); // Obtener la imagen como Blob
        return URL.createObjectURL(blob); // Crear una URL para el Blob
      } else {
        throw new Error(
          `Error al cargar la imagen del QR: ${response.status} - ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error al obtener la imagen del QR:", error);
      return null; // Retornar null si hay error, para mostrar un placeholder
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

    // Crear un objeto PartDto con los datos de la pieza, incluyendo los nombres
    const partDto = {
      customPart: {
        id: customPart.id,
        customPart: customPart.customPart, // Incluir el nombre de la pieza
      },
      partMaterial: {
        id: partMaterial.id,
        materialName: partMaterial.materialName, // Incluir el nombre del material
      },
      totalweightKg: parseFloat(newPiece.totalweightKg),
      sheetThicknessMm: parseFloat(newPiece.sheetThicknessMm),
      lengthPiecesMm: parseFloat(newPiece.lengthPiecesMm),
      heightMm: parseFloat(newPiece.heightMm),
      widthMm: parseFloat(newPiece.widthMm),
      observations: newPiece.observations,
    };

    console.log("Enviando datos al backend para generar QR:", partDto);

    try {
      const response = await QRCodeService.generateQRCode(partDto);

      if (response.success && response.data.filePath) {
        const qrCodeFilePath = response.data.filePath;

        setProject((prev) => ({
          ...prev,
          pieces: [...prev.pieces, { ...newPiece, qrCodeFilePath }],
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
      } else {
        setError(
          "Error al generar el código QR: Respuesta inesperada del servidor."
        );
      }
    } catch (error) {
      console.error("Error generating QR:", error);
      setError("Error al generar el código QR.");
    }
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
      qrCodeFilePath: "", // Nuevo QR se generará al agregar
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

      // Construir partDtos incluyendo los nombres de CustomPart y PartMaterial
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
            customPart: customPart?.customPart || "Sin nombre", // Incluir el nombre
          },
          partMaterial: {
            id: piece.partMaterialId,
            materialName: partMaterial?.materialName || "Sin material", // Incluir el nombre
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
        setProject({
          clientAlias: "",
          contact: "",
          state: true,
          visitDateTime: "",
          installationDateTime: "",
          pieces: [],
        });
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

          {/* Botones centrados para piezas - Formando triángulo invertido
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
          </div> */}

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
                    {piece.qrCodeFilePath && (
                      <img
                        src={
                          qrImageUrls[piece.qrCodeFilePath] ||
                          "/placeholder-qr.png"
                        } // Usar URL desde estado
                        alt="QR Code"
                        width="50"
                        height="50"
                        onError={(e) => {
                          e.target.src = "/placeholder-qr.png"; // Fallback si la imagen no carga
                        }}
                        className={styles.qrImage}
                      />
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
