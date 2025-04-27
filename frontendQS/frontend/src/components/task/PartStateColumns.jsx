import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthContext from "../../auth/UseAuthContext";
import PartStateGroupService from "../../services/PartStateGroupService";

const PartStateColumns = () => {
  const [partsByState, setPartsByState] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { role } = useAuthContext();

  useEffect(() => {
    const fetchParts = async () => {
      const response = await PartStateGroupService.getAllPartsByState();
      if (response.success) setPartsByState(response.data);
      else setError(response.message);
    };
    fetchParts();
  }, []);

  const basePath = role === "ADMIN" ? "/admin" : "/operator";
  const handleColumnClick = (state) =>
    navigate(`${basePath}/parts/state/${state}`);

  const columnColors = {
    CONTROL_CALIDAD_EN_FABRICA: "#1a2a44",
    SOLDADO_FLAPEADO: "#2b4a6b",
    FOFATIZADO_LIJADO: "#3b6978",
    PINTADO: "#4a8295",
    EMBALADO: "#5b9eb3",
    INSTALACION_DOMICILIO: "#6cbad1",
    INSTALADO_EXITOSO: "#7ed5ef",
    FALTANTE: "#dc2626",
    DEVOLUCION_FUERA_DE_MEDIDA: "#f97316",
    REPINTANDO_POR_GOLPE_O_RAYON: "#eab308",
    REPARACION: "#ef4444",
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-8 lg:px-10 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-800">
          Piezas por Estado
        </h1>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {partsByState.map((stateGroup, index) => (
            <div
              key={index}
              className="flex-1 w-full sm W-auto min-w-[150px] max-w-[200px] sm:max-w-[220px] lg:max-w-[250px] xl:max-w-[280px] bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div
                className="text-white flex items-center justify-center min-h-[48px] py-2 rounded-t-lg cursor-pointer hover:brightness-110 transition-colors"
                style={{
                  backgroundColor: columnColors[stateGroup.state] || "#1a2a44",
                }}
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartStateColumns;
