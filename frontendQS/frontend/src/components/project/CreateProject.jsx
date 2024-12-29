import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import BackButton from "../../fragments/BackButton";
import CustomPartService from "../../services/CustomPartService";
import PartMaterialService from "../../services/PartMaterialService";
import ProjectService from "../../services/ProjectService";
import styles from "./CreateProject.module.css";

function CreateProject() {
  const [project, setProject] = useState({
    projectName: "",
    clientAlias: "",
    contact: "",
    state: true,
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

  const handleAddPiece = () => {
    if (!newPiece.customPartId || !newPiece.partMaterialId) {
      alert("Por favor, seleccione una pieza y un material.");
      return;
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!project.projectName || !project.clientAlias || !project.contact) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    try {
      await ProjectService.createNewProject(project);
      alert("¡Proyecto creado con éxito!");
      setProject({
        projectName: "",
        clientAlias: "",
        contact: "",
        state: true,
        pieces: [],
      });
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
          <div>
            <label>Nombre del Proyecto</label>
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
            <label>Alias del Cliente</label>
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
                {/* <th>Observaciones</th> */}
                <th>Acciones</th>
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
                  {/* <td>{piece.observations}</td> */}
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() =>
                        setProject((prev) => ({
                          ...prev,
                          pieces: prev.pieces.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      Eliminar
                    </button>
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
                    className={styles.inputText}
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
                    className={styles.inputText}
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
                    placeholder="Alto (mm)"
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
                    placeholder="Ancho (mm)"
                    className={styles.inputText}
                  />
                </td>
                {/* <td>
                  <input
                    type="text"
                    value={newPiece.observations}
                    onChange={(e) =>
                      setNewPiece({ ...newPiece, observations: e.target.value })
                    }
                    placeholder="Observaciones"
                    className={styles.inputText}
                  />
                </td> */}
                <td>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddPiece}
                  >
                    Agregar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <button type="submit" className="btn btn-success">
            Crear Proyecto
          </button>
        </form>
      </div>
      <BackButton />
    </>
  );
}

export default CreateProject;
