import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import QRPrintTemplate from "./QRPrintTemplate";

const PrintQRModal = ({
  parts = [],
  qrImageUrls = {},
  project = {},
  onClose,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPartsToPrint, setSelectedPartsToPrint] = useState([]);
  const printRef = useRef();

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
      setSelectedPartsToPrint([]);
      setShowModal(false);
      if (onClose) onClose();
    },
    onPrintError: (errorLocation, error) => {
      console.error("Error al intentar imprimir:", errorLocation, error);
      alert("Error al intentar imprimir. Por favor, intenta nuevamente.");
    },
  });

  const handleSelectPartToPrint = (partId) => {
    setSelectedPartsToPrint((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId]
    );
  };

  const handleSelectAllPartsToPrint = () => {
    if (!Array.isArray(parts) || parts.length === 0) return;
    if (selectedPartsToPrint.length === parts.length) {
      setSelectedPartsToPrint([]);
    } else {
      setSelectedPartsToPrint(parts.map((part) => part.id));
    }
  };

  const handlePrintSelected = () => {
    console.log("Iniciando handlePrintSelected...");
    console.log("Piezas seleccionadas:", selectedPartsToPrint);
    console.log("Estado de project:", project);
    console.log("Estado de qrImageUrls:", qrImageUrls);

    if (!selectedPartsToPrint || selectedPartsToPrint.length === 0) {
      alert("Por favor, selecciona al menos una pieza para imprimir.");
      return;
    }

    if (!Array.isArray(parts) || parts.length === 0) {
      alert("No hay piezas disponibles para imprimir.");
      return;
    }

    const partsToPrint = parts.filter((part) =>
      selectedPartsToPrint.includes(part.id)
    );
    if (!partsToPrint || partsToPrint.length === 0) {
      alert("No se encontraron piezas seleccionadas para imprimir.");
      return;
    }

    const missingQRs = partsToPrint.filter(
      (part) => !qrImageUrls[part.qrCodeFilePath]
    );
    if (missingQRs.length > 0) {
      console.warn(
        "Faltan imágenes QR para las siguientes piezas:",
        missingQRs
      );
      alert(
        "Algunas imágenes QR no están disponibles. Por favor, espera a que se carguen todas las imágenes."
      );
      return;
    }

    setTimeout(() => {
      console.log("Llamando a handlePrint...");
      try {
        handlePrint();
      } catch (err) {
        console.error("Error al intentar imprimir:", err);
        alert("Error al intentar imprimir. Por favor, intenta nuevamente.");
      }
    }, 100);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="mt-2 text-white hover:text-gray-200"
      >
        <FaPrint size={14} />
      </button>

      {showModal && (
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
                    Array.isArray(parts) &&
                    parts.length > 0 &&
                    selectedPartsToPrint.length === parts.length
                  }
                  onChange={handleSelectAllPartsToPrint}
                />
                <span>Seleccionar todos</span>
              </label>
            </div>
            <div className="max-h-60 overflow-y-auto mb-4">
              {Array.isArray(parts) && parts.length > 0 ? (
                parts.map((part) => (
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
                ))
              ) : (
                <p className="text-gray-500">No hay piezas disponibles.</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPartsToPrint([]);
                  if (onClose) onClose();
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

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <QRPrintTemplate
            parts={
              Array.isArray(parts)
                ? parts.filter((part) => selectedPartsToPrint.includes(part.id))
                : []
            }
            qrImageUrls={qrImageUrls}
            project={project}
          />
        </div>
      </div>
    </>
  );
};

PrintQRModal.propTypes = {
  parts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      customPart: PropTypes.shape({
        customPartName: PropTypes.string,
      }),
      partMaterial: PropTypes.shape({
        materialName: PropTypes.string,
      }),
      totalweightKg: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      sheetThicknessMm: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]),
      lengthPiecesMm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      heightMm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      widthMm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      qrCodeFilePath: PropTypes.string,
    })
  ),
  qrImageUrls: PropTypes.objectOf(PropTypes.string),
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    clientAlias: PropTypes.string,
    parts: PropTypes.array,
  }),
  onClose: PropTypes.func,
};

PrintQRModal.defaultProps = {
  parts: [],
  qrImageUrls: {},
  project: {},
  onClose: null,
};

export default PrintQRModal;
