import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FooterDashboard from "../../components/FooterDashboard";
import NavbarDashboard from "../../components/NavbarDashboard";
import TaskService from "../../services/TaskService";

const Tasks = () => {
  const [tasks, setTasks] = useState({
    CONTROL_CALIDAD_EN_FABRICA: [],
    SOLDADO_FLAPEADO: [],
    FOFATIZADO_LIJADO: [],
    PINTADO: [],
    EMBALADO: [],
    INSTALACION_DOMICILIO: [],
    OBSERVADAS: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Cargar las piezas al montar el componente
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const controlCalidad = await TaskService.getTasksByState(
          "CONTROL_CALIDAD_EN_FABRICA"
        );
        const soldadoFlapeado = await TaskService.getTasksByState(
          "SOLDADO_FLAPEADO"
        );
        const fofatizadoLijado = await TaskService.getTasksByState(
          "FOFATIZADO_LIJADO"
        );
        const pintado = await TaskService.getTasksByState("PINTADO");
        const embalado = await TaskService.getTasksByState("EMBALADO");
        const instalacionDomicilio = await TaskService.getTasksByState(
          "INSTALACION_DOMICILIO"
        );
        const observadas = await TaskService.getObservedTasks();

        // Ordenar por installationDateTime
        const sortByInstallationDate = (tasks) =>
          tasks.sort((a, b) => {
            const dateA = new Date(a.part.project.installationDateTime);
            const dateB = new Date(b.part.project.installationDateTime);
            return dateA - dateB;
          });

        setTasks({
          CONTROL_CALIDAD: sortByInstallationDate(controlCalidad),
          SOLDADO_FLAPEADO: sortByInstallationDate(soldadoFlapeado),
          FOFATIZADO_LIJADO: sortByInstallationDate(fofatizadoLijado),
          PINTADO: sortByInstallationDate(pintado),
          EMBALADO: sortByInstallationDate(embalado),
          INSTALACION_DOMICILIO: sortByInstallationDate(instalacionDomicilio),
          OBSERVADAS: sortByInstallationDate(observadas),
        });
      } catch (err) {
        setError("Error al cargar las tareas. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Manejar clic en una columna para redirigir
  const handleColumnClick = (category) => {
    navigate(`/tasks/${category}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-gray-800 text-lg">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavbarDashboard />

      {/* Contenido principal */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Tareas
        </h1>

        {/* Tabla de columnas */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                {[
                  "Control de Calidad en Fabrica",
                  "Soldado y Flapeado",
                  "Fofatizado y Lijado",
                  "Pintado",
                  "Embalado",
                  "Instalación Domicilio",
                  "Piezas Observadas",
                ].map((title, index) => (
                  <th
                    key={title}
                    className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200"
                    onClick={() =>
                      handleColumnClick(
                        index === 0
                          ? "CONTROL_CALIDAD_EN_FABRICA"
                          : index === 1
                          ? "SOLDADO_FLAPEADO"
                          : index === 2
                          ? "FOFATIZADO_LIJADO"
                          : index === 3
                          ? "PINTADO"
                          : index === 4
                          ? "EMBALADO"
                          : index === 5
                          ? "INSTALACION_DOMICILIO"
                          : "OBSERVADAS"
                      )
                    }
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.keys(tasks).map((category) => (
                  <td
                    key={category}
                    className="p-3 border-t border-gray-200 align-top"
                  >
                    {tasks[category].length === 0 ? (
                      <p className="text-gray-500">No hay piezas</p>
                    ) : (
                      <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {tasks[category].map((task) => (
                          <li
                            key={task.id}
                            className="bg-gray-50 p-2 rounded-md text-gray-700 text-sm"
                          >
                            <p>
                              <strong>ID Pieza:</strong> {task.part.id}
                            </p>
                            <p>
                              <strong>ID Proyecto:</strong>{" "}
                              {task.part.project.id}
                            </p>
                            <p>
                              <strong>Nombre:</strong>{" "}
                              {task.part.customPart.customPartName}
                            </p>
                            <p>
                              <strong>Fecha Instalación:</strong>{" "}
                              {new Date(
                                task.part.project.installationDateTime
                              ).toLocaleDateString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <FooterDashboard />
    </div>
  );
};

export default Tasks;
