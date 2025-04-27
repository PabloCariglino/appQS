import { useEffect, useState } from "react";
import PartTrackingService from "../../services/PartTrackingService";

const UserTasks = () => {
  const [currentTasks, setCurrentTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const confirm = window.confirm("¿Seguro que desea finalizar esta pieza?");
    if (confirm) {
      try {
        const response = await PartTrackingService.completePart(partId);
        if (response.success) {
          await fetchTasks();
          setError(null);
        } else {
          setError(response.message || "Error al completar la pieza.");
        }
      } catch (err) {
        setError("Error al completar la pieza. Por favor, intenta de nuevo.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-8 lg:px-10 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Mis Piezas
        </h1>

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
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Piezas en Proceso
              </h2>
              {currentTasks.length > 0 ? (
                currentTasks.map((task) => (
                  <div
                    key={task.trackingId}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                  >
                    <p className="text-gray-800 text-sm">
                      <span className="font-medium">Proyecto ID:</span>{" "}
                      {task.projectId || "N/A"}
                    </p>
                    <p className="text-gray-800 text-sm">
                      <span className="font-medium">Pieza ID:</span>{" "}
                      {task.partId || "N/A"}
                    </p>
                    <p className="text-gray-800 text-sm">
                      <span className="font-medium">Nombre:</span>{" "}
                      {task.partName || "Sin nombre"}
                    </p>
                    <p className="text-gray-800 text-sm">
                      <span className="font-medium">Estado:</span>{" "}
                      {task.partState || "N/A"}
                    </p>
                    <button
                      onClick={() => handleCompletePart(task.partId)}
                      className="mt-3 px-3 py-1 rounded text-white bg-green-500 hover:bg-green-600"
                    >
                      Finalizar pieza
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No tienes piezas en proceso.
                </p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Últimas 15 Piezas Completadas
              </h2>
              {completedTasks.length > 0 ? (
                <ul className="space-y-3">
                  {completedTasks.map((task) => (
                    <li
                      key={task.trackingId}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                    >
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Proyecto ID:</span>{" "}
                        {task.projectId || "N/A"}
                      </p>
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Pieza ID:</span>{" "}
                        {task.partId || "N/A"}
                      </p>
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Nombre:</span>{" "}
                        {task.partName || "Sin nombre"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">
                  No tienes piezas completadas.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserTasks;
