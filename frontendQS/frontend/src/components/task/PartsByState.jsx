/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import useAuthContext from "../../auth/UseAuthContext";
import PartStateGroupService from "../../services/PartStateGroupService";
import PartTrackingService from "../../services/PartTrackingService";

const PartsByState = ({ state }) => {
  const [parts, setParts] = useState([]);
  const [displayedParts, setDisplayedParts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [partToTake, setPartToTake] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const { role } = useAuthContext();

  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      try {
        const response = await PartStateGroupService.getAllPartsByState();
        if (response.success) {
          const stateGroup = response.data.find(
            (group) => group.state === state
          );
          const partsData = stateGroup ? stateGroup.parts : [];
          if (import.meta.env.MODE === "development") {
            console.log("fetchParts: Datos de piezas recibidos:", partsData);
          }
          setParts(partsData);
          setDisplayedParts(partsData.slice(0, 20));
          setHasMore(partsData.length > 20);
          if (partsData.length === 0) {
            setError(
              `No se encontraron piezas en el estado ${(state || "").replace(
                /_/g,
                " "
              )}.`
            );
          } else {
            setError(null);
          }
        } else {
          setError(response.message || "Error al cargar las piezas.");
        }
      } catch (err) {
        setError("Error al obtener las piezas. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    if (state) fetchParts();
  }, [state]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const currentLength = displayedParts.length;
          const nextParts = parts.slice(currentLength, currentLength + 20);
          setDisplayedParts((prev) => [...prev, ...nextParts]);
          setHasMore(currentLength + nextParts.length < parts.length);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef && observerRef.current) {
        observerRef.current.unobserve(currentLoadMoreRef);
      }
    };
  }, [displayedParts, hasMore, parts]);

  const handleTakePart = async (partId, isTaken) => {
    if (isTaken) {
      setModalMessage("Esta pieza ya está tomada por otro usuario.");
      setShowModal(true);
      return;
    }

    try {
      const activeTasksResponse = await PartTrackingService.getActiveTasks();
      if (!activeTasksResponse.success) {
        setModalMessage(activeTasksResponse.message);
        setShowModal(true);
        return;
      }

      const activeTasks = activeTasksResponse.data || [];
      if (activeTasks.length > 0) {
        setModalMessage(
          "Usted ya tiene una pieza en proceso de producción. Finalice la tarea actual antes de tomar otra."
        );
        setShowModal(true);
        return;
      }

      setPartToTake(partId);
      setShowConfirmModal(true);
    } catch (err) {
      setModalMessage(
        err.response?.data?.message ||
          err.message ||
          "Error al tomar la pieza. Por favor, intenta de nuevo."
      );
      setShowModal(true);
    }
  };

  const confirmTakePart = async () => {
    if (!partToTake) return;

    try {
      const response = await PartTrackingService.takePart(partToTake);
      if (response.success) {
        const fetchParts = async () => {
          const response = await PartStateGroupService.getAllPartsByState();
          if (response.success) {
            const stateGroup = response.data.find(
              (group) => group.state === state
            );
            const partsData = stateGroup ? stateGroup.parts : [];
            setParts(partsData);
            setDisplayedParts(partsData.slice(0, 20));
            setHasMore(partsData.length > 20);
          }
        };
        await fetchParts();
        setError(null);
      } else {
        setModalMessage(
          response.message ||
            "Error al tomar la pieza. Por favor, intenta de nuevo."
        );
        setShowModal(true);
      }
    } catch (err) {
      setModalMessage(
        err.response?.data?.message ||
          err.message ||
          "Error al tomar la pieza. Por favor, intenta de nuevo."
      );
      setShowModal(true);
    } finally {
      setShowConfirmModal(false);
      setPartToTake(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setPartToTake(null);
  };

  const isAdmin = role === "ADMIN";

  return (
    <div className="max-w-full h-[calc(100vh-7rem)]">
      <h2
        className={`text-center text-2xl md:text-3xl font-bold mb-4 mt-4 ${
          isAdmin ? "text-red-600" : "text-blue-800"
        }`}
      >
        Piezas en estado {(state || "").replace(/_/g, " ")}
      </h2>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Advertencia
            </h2>
            <p className="text-gray-600 mb-4">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 w-full transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmar Acción
            </h2>
            <p className="text-gray-600 mb-4">
              ¿Seguro que desea tomar esta pieza para su producción?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmTakePart}
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

      {loading ? (
        <p className="text-gray-500 text-sm text-center">Cargando piezas...</p>
      ) : error ? (
        <div
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-center"
          role="alert"
        >
          {error}
        </div>
      ) : parts.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-[calc(100vh-15rem)] overflow-y-auto mt-2 shadow-lg">
          <ul className="space-y-2">
            {displayedParts.map((part) => (
              <li
                key={part.partId}
                className="border-b border-gray-100 py-2 last:border-b-0 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition-colors p-2 rounded-md min-[1300px]:max-w-[100%]"
              >
                <div className="mb-2 sm:mb-0">
                  <p className="text-gray-800 text-sm">
                    <span className="font-medium">Proyecto ID:</span>{" "}
                    {part.projectId || "N/A"}
                  </p>
                  <p className="text-gray-800 text-sm">
                    <span className="font-medium">Pieza ID:</span> {part.partId}
                  </p>
                  <p className="text-gray-800 text-sm">
                    <span className="font-medium">Nombre:</span> {part.partName}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTakePart(part.partId, part.isTaken)}
                    disabled={part.isTaken || isAdmin}
                    className={`px-3 py-1 rounded text-white text-sm transition-colors ${
                      part.isTaken
                        ? "bg-gray-400 cursor-not-allowed"
                        : isAdmin
                        ? "bg-red-600 cursor-not-allowed pointer-events-none"
                        : "bg-blue-800 hover:bg-blue-900"
                    }`}
                  >
                    Tomar pieza
                  </button>
                  {part.isTaken && (
                    <span className="text-red-500 text-xs italic">
                      Pieza ya tomada
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {hasMore && (
            <div ref={loadMoreRef} className="text-center py-2">
              <p className="text-gray-500 text-sm">Cargando más piezas...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 max-h-[calc(100vh-10rem)]">
          <p className="text-gray-500 text-sm text-center">
            No hay piezas en este estado.
          </p>
        </div>
      )}
    </div>
  );
};

export default PartsByState;
