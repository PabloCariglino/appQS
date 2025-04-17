import { useEffect, useState } from "react";
import OperatorProfileService from "../../services/OperatorProfileService";

const OperatorTasks = () => {
  const [currentTasks, setCurrentTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await OperatorProfileService.getOperatorTasks();
        if (response.success) {
          setCurrentTasks(response.data.currentTasks || []);
          setCompletedTasks(response.data.completedTasks || []);
          setError(null);
        } else {
          setError(response.message || "Error al cargar las tareas.");
        }
      } catch (err) {
        setError("Error al obtener las tareas. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleCompleteTask = async (trackingId) => {
    const confirm = window.confirm("¿Seguro que desea finalizar esta tarea?");
    if (confirm) {
      const response = await OperatorProfileService.completeTask(trackingId);
      if (response.success) {
        setCurrentTasks(currentTasks.filter((task) => task.id !== trackingId));
        setCompletedTasks([...completedTasks, response.data]);
        setError(null);
      } else {
        setError(response.message || "Error al completar la tarea.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-8 lg:px-10 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Mis Tareas
        </h1>

        {loading ? (
          <p className="text-gray-500 text-center text-sm">
            Cargando tareas...
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
            {/* Tareas en Proceso */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Pieza en proceso
              </h2>
              {currentTasks.length > 0 ? (
                currentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4"
                  >
                    <p className="text-gray-800 text-sm">
                      <span className="font-medium">Proyecto ID:</span>{" "}
                      {task.part?.project?.id || "N/A"}
                    </p>
                    <p className="text-gray-800 text-sm">
                      <span className="font-medium">Pieza ID:</span>{" "}
                      {task.part?.id || "N/A"}
                    </p>
                    <p className="text-gray-800 text-sm">
                      <span className="font-medium">Nombre:</span>{" "}
                      {task.part?.customPart?.customPartName || "Sin nombre"}
                    </p>
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="mt-3 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Finalizar proceso
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No tienes piezas en proceso.
                </p>
              )}
            </div>

            {/* Tareas Completadas */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Tareas Completadas
              </h2>
              {completedTasks.length > 0 ? (
                <ul className="space-y-3">
                  {completedTasks.map((task) => (
                    <li
                      key={task.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                    >
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Proyecto ID:</span>{" "}
                        {task.part?.project?.id || "N/A"}
                      </p>
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Pieza ID:</span>{" "}
                        {task.part?.id || "N/A"}
                      </p>
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Nombre:</span>{" "}
                        {task.part?.customPart?.customPartName || "Sin nombre"}
                      </p>
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Duración:</span>{" "}
                        {task.taskDuration
                          ? `${task.taskDuration} minutos`
                          : "N/A"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">
                  No tienes tareas completadas.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OperatorTasks;
