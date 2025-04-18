import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OperatorProfileService from "../../services/OperatorProfileService";
import PartService from "../../services/PartService";

const PartsByState = () => {
  const { state } = useParams();
  const [parts, setParts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [modalMessage, setModalMessage] = useState(""); // State for modal message

  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      console.log("Fetching parts for state:", state);
      try {
        const response = await PartService.getPartsByState(state);
        console.log("Response in PartsByState:", response);
        if (response.success) {
          const partsData = Array.isArray(response.data) ? response.data : [];
          console.log("Parts data:", partsData);
          setParts(partsData);
          if (partsData.length === 0) {
            setError(
              `No se encontraron piezas en el estado ${state.replace(
                /_/g,
                " "
              )}.`
            );
          } else {
            setError(null);
          }
        } else {
          setError(response.message || "Error al cargar las piezas.");
        }
      } catch (err) {
        setError("Error al obtener las piezas. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [state]);

  const handleTakeTask = async (partId) => {
    const tasksResponse = await OperatorProfileService.getOperatorTasks();
    if (!tasksResponse.success) {
      setModalMessage(tasksResponse.message);
      setShowModal(true);
      return;
    }

    if (tasksResponse.data.currentTasks?.length > 0) {
      setModalMessage(
        "Usted ya tiene una pieza en proceso de producción. Finalice la tarea actual antes de tomar otra."
      );
      setShowModal(true);
      return;
    }

    const confirm = window.confirm(
      "¿Seguro que desea tomar esta pieza para su producción?"
    );
    if (confirm) {
      const response = await OperatorProfileService.assignPart(partId);
      if (response.success) {
        setParts(parts.filter((part) => part.partId !== partId));
        setError(null);
      } else {
        setModalMessage(response.message);
        setShowModal(true);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-8 lg:px-10 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Piezas en estado {state?.replace(/_/g, " ")}
        </h1>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Advertencia
              </h2>
              <p className="text-gray-600 mb-4">{modalMessage}</p>
              <button
                onClick={closeModal}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-center text-sm">
            Cargando piezas...
          </p>
        ) : error ? (
          <div
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-center"
            role="alert"
          >
            {error}
          </div>
        ) : parts.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <ul className="space-y-3">
              {parts.map((part) => (
                <li
                  key={part.partId}
                  className="border-b border-gray-100 pb-3 last:border-b-0 flex justify-between items-center"
                >
                  <div>
                    <p className="text-gray-800 text-sm">
                      <span className="font-medium">Proyecto ID:</span>{" "}
                      {part.projectId || "N/A"}
                    </p>
                    <p className="text-gray-800 text-sm">
                      <span className="font-medium">Pieza ID:</span>{" "}
                      {part.partId}
                    </p>
                    <p className="text-gray-800 text-sm">
                      <span className="font-medium">Nombre:</span>{" "}
                      {part.partName}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTakeTask(part.partId)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Tomar tarea
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-gray-500 text-center text-sm">
              No hay piezas en este estado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartsByState;
