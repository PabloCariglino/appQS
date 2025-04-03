import { BrowserMultiFormatReader } from "@zxing/library";
import { useContext, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import PartScannerService from "../../services/PartScannerService";
import FooterDashboard from "../FooterDashboard";
import NavbarDashboard from "../NavbarDashboard";

// Sonidos para notificaciones
const successSound = new Audio("/sounds/success.mp3");
const warningSound = new Audio("/sounds/warning.mp3");

const PartScanner = () => {
  const [scannedParts, setScannedParts] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [lastScannedPartId, setLastScannedPartId] = useState(null);
  const [cameraList, setCameraList] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);

  // Notificación de prueba al montar el componente
  useEffect(() => {
    console.log("Montando componente PartScanner...");
    toast.success("Componente PartScanner cargado", {
      duration: 2000,
      position: "center",
    });
  }, []);

  // Cargar piezas escaneadas desde el backend al montar el componente
  useEffect(() => {
    const fetchScannedParts = async () => {
      console.log("Iniciando carga de piezas escaneadas...");
      const response = await PartScannerService.getScannedParts();
      if (response.success) {
        console.log("Piezas escaneadas cargadas:", response.data);
        setScannedParts(response.data);
      } else {
        console.error(
          "Error al cargar las piezas escaneadas:",
          response.message
        );
        setError("Error al cargar las piezas escaneadas.");
        toast.error("Error al cargar las piezas escaneadas.", {
          duration: 3000,
          position: "center",
        });
      }
    };
    fetchScannedParts();
  }, []);

  // Inicializar cámara y listar dispositivos
  useEffect(() => {
    let isMounted = true;

    const initializeCamera = async () => {
      try {
        console.log("Inicializando cámara...");
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error(
            "El navegador no soporta acceso a dispositivos de medios."
          );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (isMounted) {
          stream.getTracks().forEach((track) => track.stop());

          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(
            (device) => device.kind === "videoinput"
          );
          if (videoDevices.length > 0) {
            setCameraList(videoDevices);
            setSelectedCamera(videoDevices[0].deviceId);
            console.log("Cámaras encontradas:", videoDevices);
          } else {
            setError("No se encontraron cámaras disponibles.");
            toast.error("No se encontraron cámaras disponibles.", {
              duration: 3000,
              position: "center",
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error al inicializar cámaras:", err);
          setError(`Error al listar cámaras: ${err.message || "Desconocido"}`);
          toast.error(
            `Error al listar cámaras: ${err.message || "Desconocido"}`,
            {
              duration: 3000,
              position: "center",
            }
          );
        }
      }
    };

    initializeCamera();

    return () => {
      isMounted = false;
    };
  }, []);

  // Función para manejar la subida de una imagen QR
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const codeReader = new BrowserMultiFormatReader();
    try {
      setIsScanning(true);
      setError(null);
      console.log("Procesando imagen QR...");

      const imageUrl = URL.createObjectURL(file);
      imageRef.current.src = imageUrl;

      await new Promise((resolve) => {
        imageRef.current.onload = resolve;
      });

      const result = await codeReader.decodeFromImageElement(imageRef.current);
      console.log("Código QR detectado en la imagen (raw):", result.getText());
      handleScan(result.getText());
    } catch (err) {
      console.error("Error al procesar la imagen QR:", err);
      setError(
        `Error al procesar la imagen QR: ${err.message || "Desconocido"}`
      );
      toast.error(
        `Error al procesar la imagen QR: ${err.message || "Desconocido"}`,
        {
          duration: 3000,
          position: "center",
        }
      );
    } finally {
      setIsScanning(false);
      codeReader.reset();
    }
  };

  const handleScan = async (data) => {
    console.log("Iniciando handleScan con data:", data);
    if (!data || lastScannedPartId === data) {
      console.log("Datos no válidos o ya escaneados, saliendo de handleScan.");
      return;
    }

    setLastScannedPartId(data);
    setIsScanning(false);

    try {
      console.log("Contenido del QR:", data);

      const partIdMatch = data.match(/Part ID:\s*([a-f0-9-]+)/);
      if (!partIdMatch) {
        console.error(
          "No se pudo extraer el ID de la pieza. Contenido del QR:",
          data
        );
        throw new Error("No se pudo extraer el ID de la pieza del QR.");
      }
      const partId = partIdMatch[1];
      console.log("ID de la pieza extraído:", partId);

      const response = await PartScannerService.getPartById(partId);
      if (!response.success) {
        console.error("Respuesta del backend:", response);
        throw new Error("Pieza no encontrada en la base de datos.");
      }

      const part = response.data;
      console.log("Pieza encontrada (detalle completo):", part);

      if (part.receptionState) {
        console.log(`Pieza ${part.id} ya fue escaneada anteriormente.`);
        toast.error(`Pieza ${part.id} ya fue escaneada anteriormente.`, {
          duration: 2000,
          position: "center",
        });
        warningSound.play();
      } else {
        console.log("Actualizando estado de la pieza...");
        const updateResponse = await PartScannerService.updatePart(part.id, {
          ...part,
          receptionState: true,
          scanDateTime: new Date().toISOString(),
        });

        if (!updateResponse.success) {
          console.error("Error al actualizar la pieza:", updateResponse);
          throw new Error("Error al actualizar el estado de recepción.");
        }

        console.log(`Pieza ${part.id} escaneada y marcada como recibida.`);
        toast.success(`Pieza ${part.id} escaneada y marcada como recibida.`, {
          duration: 3000,
          position: "center",
        });
        successSound.play();

        // Cargar la imagen con autenticación
        let imageUrl = null;
        if (part.customPart?.imageFilePath) {
          console.log(
            "Intentando cargar imagen desde:",
            part.customPart.imageFilePath
          );
          const imageResponse = await PartScannerService.getPartImage(
            part.customPart.imageFilePath
          );
          if (imageResponse.success) {
            imageUrl = imageResponse.data;
            console.log("Imagen cargada exitosamente:", imageUrl);
          } else {
            console.error("Error al cargar la imagen:", imageResponse.message);
          }
        } else {
          console.warn(
            "No se encontró imageFilePath en customPart:",
            part.customPart
          );
        }

        const newPart = {
          projectId: part.projectId || "Desconocido",
          projectNumber: part.projectId || "Desconocido",
          partId: part.id,
          partName: part.customPart?.customPartName || "Sin nombre",
          imageUrl: imageUrl,
          scanDateTime: new Date().toISOString(),
        };

        console.log("Guardando pieza escaneada:", newPart);
        const saveResponse = await PartScannerService.saveScannedPart(newPart);
        if (!saveResponse.success) {
          console.error("Error al guardar la pieza escaneada:", saveResponse);
        }

        console.log("Actualizando lista de piezas escaneadas...");
        const scannedPartsResponse = await PartScannerService.getScannedParts();
        if (scannedPartsResponse.success) {
          setScannedParts(scannedPartsResponse.data);
        } else {
          setScannedParts((prev) => [newPart, ...prev].slice(0, 10));
        }
      }
    } catch (err) {
      console.error("Error al procesar el escaneo:", err);
      setError(`Error al procesar el escaneo: ${err.message}`);
      toast.error(`Error: ${err.message}`, {
        duration: 3000,
        position: "center",
      });
    } finally {
      setTimeout(() => {
        setIsScanning(true);
        setLastScannedPartId(null);
      }, 1000);
    }
  };

  const formatDateTime = (date) =>
    new Date(date).toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleCameraChange = (event) => {
    setSelectedCamera(event.target.value);
  };

  const handleProjectClick = (projectId) => {
    if (projectId !== "Desconocido") {
      navigate(`/projects/${projectId}`);
    }
  };

  const handlePartClick = (projectId) => {
    if (projectId !== "Desconocido") {
      navigate(`/projects/${projectId}`);
    }
  };

  const isAdmin = role === "ADMIN";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarDashboard />
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-8 lg:px-10 py-8">
        <h2
          className={`text-center text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 ${
            isAdmin ? "text-red-600" : "text-blue-800"
          }`}
        >
          Escaneo de Piezas
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="max-w-lg mx-auto w-full">
          <div className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-dashboard-text mb-4 text-center">
              Escanear QR de la Pieza
            </h3>
            {cameraList.length > 0 && (
              <div className="mb-4">
                <label
                  htmlFor="cameraSelect"
                  className="block text-sm font-medium text-gray-700"
                >
                  Seleccionar cámara:
                </label>
                <select
                  id="cameraSelect"
                  value={selectedCamera || ""}
                  onChange={handleCameraChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  {cameraList.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Cámara ${camera.deviceId}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="mb-4">
              <label
                htmlFor="fileInput"
                className="block text-sm font-medium text-gray-700"
              >
                Subir imagen QR:
              </label>
              <input
                type="file"
                id="fileInput"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
              <img ref={imageRef} style={{ display: "none" }} alt="QR Code" />
            </div>
            {isScanning ? (
              <div className="text-center text-gray-500">
                Procesando imagen, por favor espera...
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Sube una imagen QR para escanear.
              </div>
            )}
          </div>
        </div>

        {scannedParts.length > 0 && (
          <div className="mt-6 sm:mt-8 max-w-full sm:max-w-4xl mx-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-dashboard-text mb-4 text-center">
              Últimas Piezas Escaneadas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-600 text-white text-sm sm:text-base">
                    <th className="p-2 sm:p-3 text-center">ID del Proyecto</th>
                    <th className="p-2 sm:p-3 text-center">ID de la Pieza</th>
                    <th className="p-2 sm:p-3 text-center">
                      Nombre de la Pieza
                    </th>
                    <th className="p-2 sm:p-3 text-center">Imagen</th>
                    <th className="p-2 sm:p-3 text-center">
                      Fecha y Hora de Recepción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scannedParts.map((part, index) => (
                    <tr
                      key={index}
                      className="border-b border-dashboard-border hover:bg-gray-100 transition-colors text-sm sm:text-base"
                    >
                      <td
                        className="p-2 sm:p-3 text-center text-dashboard-text cursor-pointer hover:underline"
                        onClick={() => handleProjectClick(part.projectId)}
                      >
                        {part.projectId || "Desconocido"}
                      </td>
                      <td
                        className="p-2 sm:p-3 text-center text-dashboard-text cursor-pointer hover:underline"
                        onClick={() => handlePartClick(part.projectId)}
                      >
                        {part.partId}
                      </td>
                      <td className="p-2 sm:p-3 text-center text-dashboard-text">
                        {part.partName}
                      </td>
                      <td className="p-2 sm:p-3 text-center">
                        {part.imageUrl ? (
                          <img
                            src={part.imageUrl}
                            alt={part.partName}
                            className="w-12 sm:w-16 h-auto mx-auto"
                            onError={(e) =>
                              (e.target.src = "/placeholder-image.png")
                            }
                          />
                        ) : (
                          <span className="text-dashboard-text">
                            Sin imagen
                          </span>
                        )}
                      </td>
                      <td className="p-2 sm:p-3 text-center text-dashboard-text">
                        {formatDateTime(part.scanDateTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <FooterDashboard />
      <Toaster position="center" />
    </div>
  );
};

export default PartScanner;
