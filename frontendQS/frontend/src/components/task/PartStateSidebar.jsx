/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  FaBox,
  FaCheckCircle,
  FaHammer,
  FaHome,
  FaPaintBrush,
  FaPaintRoller,
  FaRuler,
  FaSearch,
  FaTimesCircle,
  FaTools,
  FaWrench,
} from "react-icons/fa";
import PartStateGroupService from "../../services/PartStateGroupService";

const stateIcons = {
  CONTROL_CALIDAD_EN_FABRICA: { icon: <FaSearch />, color: "text-blue-600" },
  SOLDADO_FLAPEADO: { icon: <FaWrench />, color: "text-blue-600" },
  FOFATIZADO_LIJADO: { icon: <FaTools />, color: "text-blue-600" },
  PINTADO: { icon: <FaPaintBrush />, color: "text-blue-600" },
  EMBALADO: { icon: <FaBox />, color: "text-blue-600" },
  INSTALACION_DOMICILIO: { icon: <FaHome />, color: "text-blue-600" },
  INSTALADO_EXITOSO: { icon: <FaCheckCircle />, color: "text-green-600" },
  FALTANTE: { icon: <FaTimesCircle />, color: "text-red-600" },
  DEVOLUCION_FUERA_DE_MEDIDA: { icon: <FaRuler />, color: "text-orange-600" },
  REPINTANDO_POR_GOLPE_O_RAYON: {
    icon: <FaPaintRoller />,
    color: "text-yellow-600",
  },
  REPARACION: { icon: <FaHammer />, color: "text-red-600" },
};

const PartStateSidebar = ({ onStateSelect, selectedState }) => {
  const [partsByState, setPartsByState] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParts = async () => {
      const response = await PartStateGroupService.getAllPartsByState();
      if (response.success) setPartsByState(response.data);
      else setError(response.message);
    };
    fetchParts();
  }, []);

  return (
    <>
      {/* Vista para pantallas >= 768px */}
      <div className="hidden md:block py-6 px-4 h-full bg-white">
        {error && (
          <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          {partsByState.map((stateGroup, index) => (
            <div
              key={index}
              className={`flex items-center justify-between py-3 px-4 min-[1040px]:px-6 rounded-lg cursor-pointer border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
                selectedState === stateGroup.state
                  ? "bg-blue-50 border-blue-400"
                  : "bg-white"
              }`}
              onClick={() => onStateSelect(stateGroup.state)}
            >
              <div className="flex items-center space-x-3 min-[1040px]:space-x-4">
                <span
                  className={`text-2xl ${stateIcons[stateGroup.state]?.color}`}
                >
                  {stateIcons[stateGroup.state]?.icon || <FaTools />}
                </span>
                <h2 className="text-sm font-medium text-gray-800 tracking-wide">
                  {stateGroup.state.replace(/_/g, " ")}
                </h2>
              </div>
              <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                {stateGroup.parts.length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Vista para pantallas < 768px */}
      <div className="md:hidden py-4 px-2">
        {error && (
          <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-4 bg-white py-2">
          {partsByState.map((stateGroup, index) => (
            <div
              key={index}
              className={`relative flex-shrink-0 p-2 rounded-lg cursor-pointer border w-14 h-14 flex items-center justify-center ${
                selectedState === stateGroup.state
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 bg-white"
              } shadow-sm hover:shadow-md transition-shadow`}
              onClick={() => onStateSelect(stateGroup.state)}
            >
              <span
                className={`text-xl ${stateIcons[stateGroup.state]?.color}`}
              >
                {stateIcons[stateGroup.state]?.icon || <FaTools />}
              </span>
              <span className="absolute top-0 right-0 bg-gray-200 text-gray-700 text-xs font-medium px-1 rounded-full">
                {stateGroup.parts.length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PartStateSidebar;
