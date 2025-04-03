import PropTypes from "prop-types";

const QRPrintTemplate = ({ parts = [], qrImageUrls = {}, project = {} }) => {
  console.log("Renderizando QRPrintTemplate...");
  console.log("Partes recibidas:", parts);
  console.log("qrImageUrls:", qrImageUrls);
  console.log("Project:", project);

  if (!parts || !Array.isArray(parts) || parts.length === 0) {
    console.warn("No hay partes para renderizar en QRPrintTemplate.");
    return <div>No hay piezas para imprimir.</div>;
  }

  return (
    <div>
      {parts.map((part) => (
        <div
          key={part.id}
          style={{
            pageBreakAfter: "always",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{ borderBottom: "1px solid black", marginBottom: "10px" }}
          >
            CLIENTE: {project?.clientAlias ?? "N/A"}
          </div>
          <div
            style={{ borderBottom: "1px solid black", marginBottom: "10px" }}
          >
            PIEZA: {part.customPart?.customPartName ?? "N/A"}
          </div>
          <div
            style={{ borderBottom: "1px solid black", marginBottom: "10px" }}
          >
            MATERIAL: {part.partMaterial?.materialName ?? "N/A"}
          </div>
          <div
            style={{ borderBottom: "1px solid black", marginBottom: "10px" }}
          >
            PESO TOTAL: {part.totalweightKg ?? "N/A"} kg
          </div>
          <div
            style={{ borderBottom: "1px solid black", marginBottom: "10px" }}
          >
            ESPESOR: {part.sheetThicknessMm ?? "N/A"} mm
          </div>
          <div
            style={{ borderBottom: "1px solid black", marginBottom: "10px" }}
          >
            LARGO DE PIEZA: {part.lengthPiecesMm ?? "N/A"} mm
          </div>
          <div
            style={{ borderBottom: "1px solid black", marginBottom: "10px" }}
          >
            ALTO: {part.heightMm ?? "N/A"} mm
          </div>
          <div
            style={{ borderBottom: "1px solid black", marginBottom: "10px" }}
          >
            ANCHO: {part.widthMm ?? "N/A"} mm
          </div>
          <div
            style={{ borderBottom: "1px solid black", marginBottom: "10px" }}
          >
            CANTIDAD DE PIEZAS: 1 unidad
          </div>
          {qrImageUrls &&
          part.qrCodeFilePath &&
          qrImageUrls[part.qrCodeFilePath] ? (
            <img
              src={qrImageUrls[part.qrCodeFilePath]}
              alt="QR Code"
              style={{
                width: "200px",
                height: "200px",
                margin: "0 auto",
                display: "block",
              }}
              onError={(e) => {
                console.error(`Error al cargar QR para ${part.qrCodeFilePath}`);
                e.target.src = "/placeholder-qr.png";
              }}
            />
          ) : (
            <div>QR no disponible</div>
          )}
        </div>
      ))}
    </div>
  );
};

QRPrintTemplate.propTypes = {
  parts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      customPart: PropTypes.shape({
        customPartName: PropTypes.string,
      }),
      partMaterial: PropTypes.shape({
        materialName: PropTypes.string,
      }),
      totalweightKg: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      sheetThicknessMm: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]),
      lengthPiecesMm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      heightMm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      widthMm: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      qrCodeFilePath: PropTypes.string,
    })
  ),
  qrImageUrls: PropTypes.objectOf(PropTypes.string),
  project: PropTypes.shape({
    clientAlias: PropTypes.string,
  }),
};

QRPrintTemplate.defaultProps = {
  parts: [],
  qrImageUrls: {},
  project: {},
};

export default QRPrintTemplate;
