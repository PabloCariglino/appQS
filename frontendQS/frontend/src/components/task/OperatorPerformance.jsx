import { useEffect, useState } from "react";
import useAuthContext from "../../auth/UseAuthContext";
import PartTrackingService from "../../services/PartTrackingService";

const OperatorPerformance = () => {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { role } = useAuthContext();
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await PartTrackingService.getUserMetrics();
        if (response.success) {
          setMetrics(response.data);
          setError(null);
        } else {
          setError(response.message || "Error al cargar las métricas.");
        }
      } catch (err) {
        setError("Error al obtener las métricas. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatDuration = (minutes) => {
    if (!minutes) return "0 minutos";
    const days = Math.floor(minutes / (24 * 60));
    minutes %= 24 * 60;
    const hours = Math.floor(minutes / 60);
    minutes %= 60;
    return `${days > 0 ? `${days} días, ` : ""}${
      hours > 0 ? `${hours} horas, ` : ""
    }${minutes} minutos`;
  };

  const isAdmin = role === "ADMIN";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-8 lg:px-10 py-8">
        <h1
          className={`text-center text-2xl md:text-3xl font-bold mb-4 mt-5 ${
            isAdmin ? "text-red-600" : "text-blue-800"
          }`}
        >
          Rendimiento De Usuario
        </h1>

        {loading ? (
          <p className="text-gray-500 text-center text-sm">
            Cargando métricas...
          </p>
        ) : error ? (
          <div
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-center"
            role="alert"
          >
            {error}
          </div>
        ) : metrics ? (
          <div className="space-y-6 ">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 text-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Cantidad de Piezas Completadas
              </h2>
              <p className="text-gray-800 text-sm">
                <span className="font-medium">Último Día:</span>{" "}
                {metrics.partCountByPeriod?.DAY || 0}
              </p>
              <p className="text-gray-800 text-sm">
                <span className="font-medium">Último Mes:</span>{" "}
                {metrics.partCountByPeriod?.MONTH || 0}
              </p>
              <p className="text-gray-800 text-sm">
                <span className="font-medium">Último Año:</span>{" "}
                {metrics.partCountByPeriod?.YEAR || 0}
              </p>
            </div>

            <div className="overflow-x-auto">
              <h2 className="text-center font-semibold mb-4 mt-5 text-gray-900">
                Promedio de Tiempo por Categoría
              </h2>
              <table className="w-full max-w-[50vw] mx-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                <thead>
                  <tr className="bg-gray-600 sticky top-0 z-10">
                    <th className="px-4 py-2 text-left  text-white font-semibold">
                      Categoría (Part State)
                    </th>
                    <th className="px-4 py-2 text-left text-white font-semibold">
                      Promedio de Tiempo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.avgDurationByCategory &&
                  Object.keys(metrics.avgDurationByCategory).length > 0 ? (
                    Object.entries(metrics.avgDurationByCategory).map(
                      ([partState, avgDuration]) => (
                        <tr
                          key={partState}
                          className="border-t border-gray-200"
                        >
                          <td className="px-4 py-2 text-gray-800">
                            {partState.replace(/_/g, " ")}
                          </td>
                          <td className="px-4 py-2 text-gray-800">
                            {formatDuration(Math.round(avgDuration))}
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
                        className="px-4 py-2 text-center text-gray-500"
                      >
                        No hay datos disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No se encontraron métricas.</p>
        )}
      </div>
    </div>
  );
};

export default OperatorPerformance;
