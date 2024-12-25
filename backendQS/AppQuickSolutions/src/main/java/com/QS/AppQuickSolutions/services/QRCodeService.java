package com.QS.AppQuickSolutions.services;

import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class QRCodeService {

    @Value("${qrcode.upload-dir}")
    private String qrDirectory;

    /**
     * Genera un código QR y lo guarda en el sistema de archivos.
     *
     * @param data       Datos que se codificarán en el QR.
     * @param width      Ancho del QR.
     * @param height     Alto del QR.
     * @param fileName   Nombre del archivo QR.
     * @return La ruta completa del archivo generado.
     * @throws WriterException Si hay un error al generar el QR.
     * @throws IOException     Si hay un error al guardar el archivo.
     */
    public String generateQRCodeImage(String data, int width, int height, String fileName) throws WriterException, IOException {
        // Configuración para codificación de caracteres
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        // Asegurar que el directorio exista
        Path qrPathDirectory = FileSystems.getDefault().getPath(qrDirectory);
        if (!Files.exists(qrPathDirectory)) {
            Files.createDirectories(qrPathDirectory);
        }

        // Generar el código QR
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, width, height, hints);

        // Guardar el QR en un archivo
        Path qrPath = qrPathDirectory.resolve(fileName);
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", qrPath);

        return qrPath.toAbsolutePath().toString(); // Retornar la ruta completa
    }
}
