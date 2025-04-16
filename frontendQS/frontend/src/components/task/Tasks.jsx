// Tasks.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskService from "../../services/TaskService";
import FooterDashboard from "../FooterDashboard";
import NavbarDashboard from "../NavbarDashboard";

const Tasks = () => {
  const [tasksByState, setTasksByState] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await TaskService.getAllTasksByState();
      if (response.success) {
        console.log("Piezas agrupadas por estado recibidas:", response.data);
        setTasksByState(response.data);
        setError(null);
      } else {
        console.error("Error al cargar las tareas:", response.message);
        setError(response.message);
      }
    };

    fetchTasks();
  }, []);

  const handleColumnClick = (state) => {
    console.log("Estado al hacer clic:", state);
    if (state) {
      try {
        navigate(`/parts/state/${state}`);
      } catch (err) {
        console.error("Error al navegar:", err);
      }
    } else {
      console.warn("Estado no válido, no se puede navegar.");
    }
  };

  const columnColors = {
    CONTROL_CALIDAD_EN_FABRICA: "#1a2a44",
    SOLDADO_FLAPEADO: "#2b4a6b",
    FOFATIZADO_LIJADO: "#3b6978",
    PINTADO: "#4a8295",
    EMBALADO: "#5b9eb3",
    INSTALACION_DOMICILIO: "#6cbad1",
    INSTALADO_EXITOSO: "#7ed5ef",
    FALTANTE: "#dc2626", // Rojo para FALTANTE
    DEVOLUCION_FUERA_DE_MEDIDA: "#f97316", // Naranja para DEVOLUCION_FUERA_DE_MEDIDA
    REPINTANDO_POR_GOLPE_O_RAYON: "#eab308", // Amarillo para REPINTANDO_POR_GOLPE_O_RAYON
    REPARACION: "#ef4444", // Rojo más claro para REPARACION
  };

  return (
    <>
      <NavbarDashboard />
      <div className="min-h-screen p-2 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-800">
          Tareas
        </h1>
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-center"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {tasksByState.map((stateGroup, index) => {
            const columnKey = stateGroup.state;
            const bgColor = columnColors[columnKey] || "#1a2a44";

            return (
              <div
                key={index}
                className="flex-1 w-full sm:w-auto min-w-[150px] max-w-[200px] sm:max-w-[220px] lg:max-w-[250px] xl:max-w-[280px] bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div
                  className="text-white flex items-center justify-center min-h-[48px] py-2 rounded-t-lg cursor-pointer hover:brightness-110 transition-colors"
                  style={{ backgroundColor: bgColor }}
                  onClick={() => handleColumnClick(stateGroup.state)}
                >
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-wide text-center text-wrap">
                      {stateGroup.state.replace(/_/g, " ")}
                    </h2>
                    <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                      {stateGroup.parts.length}
                    </span>
                  </div>
                </div>
                <div className="p-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {stateGroup.parts.length > 0 ? (
                    <ul className="space-y-3">
                      {stateGroup.parts.slice(0, 20).map((part) => (
                        <li
                          key={part.partId}
                          className="border-b border-gray-100 pb-3 last:border-b-0 hover:bg-gray-50 transition-colors p-2 rounded-md"
                        >
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
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center text-sm">
                      No hay piezas en este estado.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <FooterDashboard />
    </>
  );
};

export default Tasks;
