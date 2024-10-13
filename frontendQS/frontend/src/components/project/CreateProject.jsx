import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import ProjectService from "../../services/ProjectService";
import styles from "./CreateProject.module.css";

// Opciones de materiales permitidos
const MATERIAL_OPTIONS = ["ACERO_INOX_ESMERILADO_304", "CHAPA_COMUN"];

// Opciones de nombres de piezas y sus imágenes asociadas
const PARTNAME_OPTIONS = {
  GUIA_LATERAL: "guia_lateral.png",
  FRENTE_GUIA_LATERAL: "frente_guia_lateral.png",
  PUERTA_LEVADIZA: "puerta_levadiza.png",
  PANIO_FIJO_SUPERIOR: "panio_fijo_superior.png",
  FONDO_PTA_LEV: "fondo_pta_lev.png",
  ENCASTRE_UMBRAL_CON_BP: "encastre_umbral_con_bp.png",
  UMBRAL: "umbral.png",
  ANG_AMURE_UMBRAL: "ang_amure_umbral.png",
  ZOCALO_INOX: "zocalo_inox.png",
  TECHITO_INOX: "techito_inox.png",
  PTA_BP: "pta_bp.png",
  FONDO_DE_PTA_BP: "fondo_de_pta_bp.png",
  DIVISOR_FOGONERO: "divisor_fogonero.png",
  GRASERO: "grasero.png",
  MARCO_SUPERIOR: "marco_superior.png",
  PUERTA_ALACENA: "puerta_alacena.png",
  FONDO_PUERTA_ALACENA: "fondo_puerta_alacena.png",
  TAPA_SUPERIOR_ALACENA: "tapa_superior_alacena.png",
  ESTANTE_ALACENA: "estante_alacena.png",
  FRENTE_PUERTA: "frente_puerta.png",
  FONDO_PUERTA: "fondo_puerta.png",
  PUERTA_BAJO_MESADA: "puerta_bajo_mesada.png",
  FONDO_DE_PUERTA_BAJO_MESADA: "fondo_de_puerta_bajo_mesada.png",
  PIEZA_PERSONALIZADA: "pieza_personalizada.png",
  LATERAL_MARCO_PARRILLA: "lateral_marco_parrilla.png",
  FRENTE_MARCO_PARRILLA: "frente_marco_parrilla.png",
  CANASTO_FOGONERO: "canasto_fogonero.png",
};

function CreateProject() {
  const [project, setProject] = useState({
    projectName: "",
    clientAlias: "",
    contact: "",
    state: true, // Default to true (hidden field)
    createdDate: new Date(),
    pieces: [],
  });

  const [newPiece, setNewPiece] = useState({
    partName: "",
    material: "",
    totalweightKg: "",
    SheetThicknessMm: "",
    lengthPiecesMm: "",
    heightMm: "",
    widthMm: "",
    qrCodeData: "",
    qrCodeUrl: "",
    scanDateTime: "",
    receptionState: false,
    qualityControlState: false,
    observations: "",
  });

  const handleAddPiece = () => {
    if (!newPiece.partName || !newPiece.material) {
      alert("Por favor, complete el nombre de la pieza y el material.");
      return;
    }

    setProject((prev) => ({
      ...prev,
      pieces: [...prev.pieces, newPiece],
    }));

    // Resetear la pieza después de agregarla
    setNewPiece({
      partName: "",
      material: "",
      totalweightKg: "",
      SheetThicknessMm: "",
      lengthPiecesMm: "",
      heightMm: "",
      widthMm: "",
      qrCodeData: "",
      qrCodeUrl: "",
      scanDateTime: "",
      receptionState: false,
      qualityControlState: false,
      observations: "",
    });
  };

  const replicateLastPiece = () => {
    if (project.pieces.length === 0) return;

    const lastPiece = project.pieces[project.pieces.length - 1];
    const { id, qrCodeData, qrCodeUrl, ...restOfPiece } = lastPiece;

    setProject((prev) => ({
      ...prev,
      pieces: [
        ...prev.pieces,
        { ...restOfPiece, qrCodeData: "", qrCodeUrl: "" },
      ],
    }));
  };

  const handleDeletePiece = (index) => {
    setProject((prev) => ({
      ...prev,
      pieces: prev.pieces.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await ProjectService.createNewProject(project);
      alert("¡Proyecto creado con éxito!");
      setProject({
        projectName: "",
        clientAlias: "",
        contact: "",
        state: true,
        createdDate: new Date(),
        pieces: [],
      });
    } catch (error) {
      console.error("Error al crear el proyecto:", error);
      alert("Hubo un error al crear el proyecto.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create a New Project</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label>Project Name</label>
          <input
            type="text"
            value={project.projectName}
            onChange={(e) =>
              setProject({ ...project, projectName: e.target.value })
            }
            required
            className={styles.inputText}
          />
        </div>
        <div>
          <label>Client Alias</label>
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
          <label>Contact</label>
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

        <h3>Pieces</h3>
        <table className={`table table-bordered ${styles.table}`}>
          <thead>
            <tr>
              <th>#</th>
              <th>Part Name</th>
              <th>Image</th>
              <th>Material</th>
              <th>Total Weight (kg)</th>
              <th>Thickness (mm)</th>
              <th>Length (mm)</th>
              <th>Height (mm)</th>
              <th>Width (mm)</th>
              <th>QR Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {project.pieces.map((piece, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{piece.partName}</td>
                <td>
                  <img
                    src={`/images/${PARTNAME_OPTIONS[piece.partName]}`}
                    alt={piece.partName}
                    style={{ width: "50px" }}
                  />
                </td>
                <td>{piece.material}</td>
                <td>{piece.totalweightKg}</td>
                <td>{piece.SheetThicknessMm}</td>
                <td>{piece.lengthPiecesMm}</td>
                <td>{piece.heightMm}</td>
                <td>{piece.widthMm}</td>
                <td>
                  <img
                    src={piece.qrCodeUrl}
                    alt="QR Code"
                    style={{ width: "50px" }}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeletePiece(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td>{project.pieces.length + 1}</td>
              <td>
                <select
                  value={newPiece.partName}
                  onChange={(e) =>
                    setNewPiece({ ...newPiece, partName: e.target.value })
                  }
                >
                  <option value="">Select Part Name</option>
                  {Object.keys(PARTNAME_OPTIONS).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                {newPiece.partName && (
                  <img
                    src={`/images/${PARTNAME_OPTIONS[newPiece.partName]}`}
                    alt={newPiece.partName}
                    style={{ width: "50px" }}
                  />
                )}
              </td>
              <td>
                <select
                  value={newPiece.material}
                  onChange={(e) =>
                    setNewPiece({ ...newPiece, material: e.target.value })
                  }
                >
                  <option value="">Select Material</option>
                  {MATERIAL_OPTIONS.map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={newPiece.totalweightKg}
                  onChange={(e) =>
                    setNewPiece({ ...newPiece, totalweightKg: e.target.value })
                  }
                  placeholder="Total Weight (kg)"
                  className={styles.inputText}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={newPiece.SheetThicknessMm}
                  onChange={(e) =>
                    setNewPiece({
                      ...newPiece,
                      SheetThicknessMm: e.target.value,
                    })
                  }
                  placeholder="Thickness (mm)"
                  className={styles.inputText}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={newPiece.lengthPiecesMm}
                  onChange={(e) =>
                    setNewPiece({ ...newPiece, lengthPiecesMm: e.target.value })
                  }
                  placeholder="Length (mm)"
                  className={styles.inputText}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={newPiece.heightMm}
                  onChange={(e) =>
                    setNewPiece({ ...newPiece, heightMm: e.target.value })
                  }
                  placeholder="Height (mm)"
                  className={styles.inputText}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={newPiece.widthMm}
                  onChange={(e) =>
                    setNewPiece({ ...newPiece, widthMm: e.target.value })
                  }
                  placeholder="Width (mm)"
                  className={styles.inputText}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={newPiece.qrCodeData}
                  onChange={(e) =>
                    setNewPiece({ ...newPiece, qrCodeData: e.target.value })
                  }
                  placeholder="QR Code Data"
                  className={styles.inputText}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddPiece}
                >
                  Add Piece
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={replicateLastPiece}
                >
                  Replicate Last Piece
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <button type="submit" className="btn btn-success">
          Create Project
        </button>
      </form>
    </div>
  );
}

export default CreateProject;
