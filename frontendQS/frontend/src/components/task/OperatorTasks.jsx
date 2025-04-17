import { useEffect, useState } from "react";
import OperatorProfileService from "../../services/OperatorProfileService";

const OperatorTasks = () => {
  const [currentTasks, setCurrentTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await OperatorProfileService.getOperatorTasks();
      if (response.success) {
        setCurrentTasks(response.data.currentTasks || []);
        setCompletedTasks(response.data.completedTasks || []);
        setError(null);
      } else {
        setError(response.message);
      }
    };

    fetchTasks();
  }, []);

  const handleCompleteTask = async (trackingId) => {
    const response = await OperatorProfileService.completeTask(trackingId);
    if (response.success) {
      setCurrentTasks(currentTasks.filter((task) => task.id !== trackingId));
      setCompletedTasks([...completedTasks, response.data]);
    } else {
      setError(response.message);
    }
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-8 lg:px-10 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Mis Tareas
        </h1>
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-center"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Piezas actuales */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-xl font-semibold mb-4">Piezas en proceso</h2>
            {currentTasks.length > 0 ? (
              <ul className="space-y-3">
                {currentTasks.map((task) => (
                  <li
                    key={task.id}
                    className="border-b border-gray-100 pb-3 last:border-b-0 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Pieza ID:</span>{" "}
                        {task.part.partId}
                      </p>
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Nombre:</span>{" "}
                        {task.part.partName}
                      </p>
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Estado:</span>{" "}
                        {task.partState.replace(/_/g, " ")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Finalizar proceso
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center text-sm">
                No hay piezas en proceso.
              </p>
            )}
          </div>

          {/* Piezas completadas en el año */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-xl font-semibold mb-4">
              Piezas completadas en 2025
            </h2>
            {completedTasks.length > 0 ? (
              <ul className="space-y-3">
                {completedTasks
                  .filter(
                    (task) => new Date(task.endTime).getFullYear() === 2025
                  )
                  .map((task) => (
                    <li
                      key={task.id}
                      className="border-b border-gray-100 pb-3 last:border-b-0"
                    >
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Pieza ID:</span>{" "}
                        {task.part.partId}
                      </p>
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Nombre:</span>{" "}
                        {task.part.partName}
                      </p>
                      <p className="text-gray-800 text-sm">
                        <span className="font-medium">Duración:</span>{" "}
                        {calculateDuration(task.startTime, task.endTime)}
                      </p>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center text-sm">
                No hay piezas completadas este año.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorTasks;
