import { useEffect, useState } from "react";
import PartTrackingService from "../../services/PartTrackingService";

const UserTasks = () => {
  const [currentTasks, setCurrentTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [partToComplete, setPartToComplete] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await PartTrackingService.getUserTasks();
      if (response.success) {
        const filteredCurrentTasks = response.data.currentTasks || [];
        const filteredCompletedTasks = (
          response.data.completedTasks || []
        ).slice(0, 15);
        setCurrentTasks(filteredCurrentTasks);
        setCompletedTasks(filteredCompletedTasks);
        setError(null);
      } else {
        setError(response.message || "Error al cargar las tareas.");
      }
    } catch (err) {
      setError(
        "Error al obtener las tareas. Por favor, verifica tu sesión e intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCompletePart = async (partId) => {
    setPartToComplete(partId);
    setShowConfirmModal(true);
  };

  const confirmCompletePart = async () => {
    if (!partToComplete) return;

    try {
      const response = await PartTrackingService.completePart(partToComplete);
      if (response.success) {
        await fetchTasks();
        setError(null);
      } else {
        setError(response.message || "Error al completar la pieza.");
      }
    } catch (err) {
      setError("Error al completar la pieza. Por favor, intenta de nuevo.");
    } finally {
      setShowConfirmModal(false);
      setPartToComplete(null);
    }
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setPartToComplete(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-8 lg:px-16 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-blue-800">
          Mis Piezas
        </h1>

        {loading ? (
          <p className="text-gray-500 text-center text-base">
            Cargando piezas...
          </p>
        ) : error ? (
          <div
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-center max-w-md mx-auto"
            role="alert"
          >
            {error}
          </div>
        ) : (
          <div className="md:grid md:grid-cols-2 md:gap-6">
            {/* Piezas en Proceso (Izquierda) */}
            <div className="mb-8 md:mb-0">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
                Piezas en Proceso
              </h2>
              {currentTasks.length > 0 ? (
                currentTasks.map((task) => (
                  <div
                    key={task.trackingId}
                    className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-4 max-w-md mx-auto hover:bg-gray-50 hover:shadow-lg transition-all"
                  >
                    <p className="text-gray-800 text-base leading-6">
                      <span className="font-medium">Proyecto ID:</span>{" "}
                      {task.projectId || "N/A"}
                    </p>
                    <p className="text-gray-800 text-base leading-6">
                      <span className="font-medium">Pieza ID:</span>{" "}
                      {task.partId || "N/A"}
                    </p>
                    <p className="text-gray-800 text-base leading-6">
                      <span className="font-medium">Nombre:</span>{" "}
                      {task.partName || "Sin nombre"}
                    </p>
                    <p className="text-gray-800 text-base leading-6">
                      <span className="font-medium">Estado:</span>{" "}
                      {task.partState || "N/A"}
                    </p>
                    <button
                      onClick={() => handleCompletePart(task.partId)}
                      className="mt-3 px-4 py-2 rounded text-white bg-blue-800 hover:bg-blue-900 transition-colors text-base"
                    >
                      Finalizar pieza
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-base text-center">
                  No tienes piezas en proceso.
                </p>
              )}
            </div>

            {/* Últimas 15 Piezas Completadas (Derecha) */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
                Últimas 15 Piezas Completadas
              </h2>
              {completedTasks.length > 0 ? (
                <ul className="space-y-3">
                  {completedTasks.map((task) => (
                    <li
                      key={task.trackingId}
                      className="bg-white rounded-xl shadow-md border border-gray-200 p-4 max-w-md mx-auto hover:bg-gray-50 hover:shadow-lg transition-all"
                    >
                      <p className="text-gray-800 text-base leading-6">
                        <span className="font-medium">Proyecto ID:</span>{" "}
                        {task.projectId || "N/A"}
                      </p>
                      <p className="text-gray-800 text-base leading-6">
                        <span className="font-medium">Pieza ID:</span>{" "}
                        {task.partId || "N/A"}
                      </p>
                      <p className="text-gray-800 text-base leading-6">
                        <span className="font-medium">Nombre:</span>{" "}
                        {task.partName || "Sin nombre"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-base text-center">
                  No tienes piezas completadas.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Modal de Confirmación */}
        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Confirmar Acción
              </h2>
              <p className="text-gray-600 mb-4">
                ¿Seguro que desea finalizar esta pieza?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={confirmCompletePart}
                  className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 flex-1 transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={closeConfirmModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 flex-1 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTasks;
