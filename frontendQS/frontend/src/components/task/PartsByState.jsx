import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TaskService from "../../services/TaskService";
import FooterDashboard from "../FooterDashboard";
import NavbarDashboard from "../NavbarDashboard";

const PartsByState = () => {
  const { state } = useParams();
  const [parts, setParts] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParts = async () => {
      const response = await TaskService.getTasksByState(state);
      if (response.success) {
        console.log(`Piezas con estado ${state} recibidas:`, response.data);
        setParts(response.data);
        setError(null);
      } else {
        console.error(
          `Error al cargar las piezas con estado ${state}:`,
          response.message
        );
        setError(response.message);
      }
    };

    fetchParts();
  }, [state]);

  const handleBack = () => {
    navigate("/operator");
  };

  return (
    <>
      <NavbarDashboard />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Piezas en estado: {state}
        </h1>
        <button
          onClick={handleBack}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Volver
        </button>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center"
            role="alert"
          >
            {error}
          </div>
        )}
        {parts.length > 0 ? (
          <ul className="space-y-4">
            {parts.map((part) => (
              <li key={part.partId} className="border rounded-lg p-4 shadow">
                <p>
                  <strong>Proyecto ID:</strong> {part.projectId || "N/A"}
                </p>
                <p>
                  <strong>Pieza ID:</strong> {part.partId}
                </p>
                <p>
                  <strong>Nombre:</strong> {part.partName}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600">
            No hay piezas en este estado.
          </p>
        )}
      </div>
      <FooterDashboard />
    </>
  );
};

export default PartsByState;
