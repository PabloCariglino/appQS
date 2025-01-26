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
        return response.url; // Devolver la URL de la imagen
      } else {
        throw new Error("Error al cargar la imagen del QR");
      }
    } catch (error) {
      console.error("Error al obtener la imagen del QR:", error);
      throw error;
    }
  };

  const handleAddPiece = async () => {
    if (!newPiece.customPartId || !newPiece.partMaterialId) {
      alert("Por favor, seleccione una pieza y un material.");
      return;
    }

    try {
      // Crear un objeto PartDto con los datos de la pieza
      const partDto = {
        customPart: { id: newPiece.customPartId },
        partMaterial: { id: newPiece.partMaterialId },
        totalweightKg: newPiece.totalweightKg,
        sheetThicknessMm: newPiece.sheetThicknessMm,
        lengthPiecesMm: newPiece.lengthPiecesMm,
        heightMm: newPiece.heightMm,
        widthMm: newPiece.widthMm,
        observations: newPiece.observations,
      };

      console.log("Enviando datos al backend para generar QR:", partDto);

      // Enviar los datos de la pieza al backend para generar el QR
      const response = await QRCodeService.generateQRCode(partDto);

      console.log("Respuesta del backend:", response);

      // Verificar si la respuesta es exitosa y contiene la propiedad filePath
      if (response.success && response.data.filePath) {
        const qrCodeFilePath = response.data.filePath;

        console.log("Ruta del archivo QR recibida:", qrCodeFilePath);

        // Agregar la pieza al proyecto con el QR generado
        setProject((prev) => ({
          ...prev,
          pieces: [...prev.pieces, { ...newPiece, qrCodeFilePath }],
        }));

        // Limpiar los campos de la nueva pieza
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
      // Asegúrate de enviar el proyecto con las piezas como un JSON
      const projectDto = {
        clientAlias: project.clientAlias,
        contact: project.contact,
        state: project.state,
        visitDateTime: project.visitDateTime,
        installationDateTime: project.installationDateTime,
      };

      // Transformar las piezas en DTO
      const partDtos = project.pieces.map((piece) => ({
        customPart: { id: piece.customPartId },
        partMaterial: { id: piece.partMaterialId },
        totalweightKg: piece.totalweightKg,
        sheetThicknessMm: piece.sheetThicknessMm,
        lengthPiecesMm: piece.lengthPiecesMm,
        heightMm: piece.heightMm,
        widthMm: piece.widthMm,
        observations: piece.observations,
      }));

      // Llamar al backend para crear el proyecto con las piezas
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
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Campos del proyecto */}
          <div>
            <label>Cliente</label>
            <input
              type="text"
              value={project.clientAlias}
              onChange={(e) =>
                setProject({ ...project, clientAlias: e.target.value })
              }
              required
              className={styles.inputText}
            />
          </div>
          <div>
            <label>Contacto</label>
            <input
              type="text"
              value={project.contact}
              onChange={(e) =>
                setProject({ ...project, contact: e.target.value })
              }
              required
              className={styles.inputText}
            />
          </div>
          <div>
            <label>Fecha de Visita</label>
            <input
              type="datetime-local"
              value={project.visitDateTime}
              onChange={(e) =>
                setProject({ ...project, visitDateTime: e.target.value })
              }
              required
              className={styles.inputDatetime}
            />
          </div>
          <div>
            <label>Fecha de Instalación estimada</label>
            <input
              type="datetime-local"
              value={project.installationDateTime}
              onChange={(e) =>
                setProject({ ...project, installationDateTime: e.target.value })
              }
              required
              className={styles.inputDatetime}
            />
          </div>

          {/* Tabla de piezas */}
          <h3>Piezas</h3>
          <table className={`table table-bordered ${styles.table}`}>
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
                        src={getQRCodeImage(piece.qrCodeFilePath)} // Usar la función getQRCodeImage
                        alt="QR Code"
                        width="50"
                        height="50"
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
                    className={styles.inputNumber}
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
                    className={styles.inputNumber}
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
                    className={styles.inputNumber}
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
                    className={styles.inputNumber}
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
                    className={styles.inputNumber}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddPiece}
                  >
                    Agregar Pieza
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-center mt-3">
            <button type="submit" className="btn btn-success">
              Crear Proyecto
            </button>
          </div>
        </form>
      </div>
      <BackButton />
    </>
  );
}

export default CreateProject;
