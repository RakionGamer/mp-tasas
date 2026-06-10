import { createCanvas, loadImage, registerFont } from "canvas";
import cloudinary from "cloudinary";
import path from "path";

try {
  registerFont(path.join(process.cwd(), "fonts", "Arial.ttf"), {
    family: "Arial",
  });
} catch (error) {
  console.error(
    "Error al registrar la fuente. Asegúrate de que el archivo 'Arial.ttf' exista en la carpeta /fonts de tu proyecto.",
    error
  );
}

const coordinates = {
  fecha: { x: 530, y: 200 },
  hora: { x: 1005, y: 200 },
  peru: { x: 492, y: 478 },
  argentina: { x: 492, y: 654 },
  brasil: { x: 492, y: 807 },
  chile: { x: 505, y: 987 },
  panama: { x: 491, y: 1150 },
  dominicana: { x: 480, y: 1329 },
  usa: { x: 1235, y: 485 },
  españa: { x: 1235, y: 670 },
  ecuador: { x: 1235, y: 820 },
  mexico: { x: 1235, y: 994 },
  bolivia: { x: 1235, y: 1153 },
};

// TODO: Reemplazar con el enlace correcto de Cloudinary de la plantilla base de COLOMBIA
const baseImageUrl =
  "https://res.cloudinary.com/dvh3nrsun/image/upload/v1781115458/5_ubkzdu.png";

export async function createImageWithRatesColombia(dataColombia, extractedData) {
  try {
    const baseImage = await loadImage(baseImageUrl);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0);
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const customSizes = {
      fecha: 48,
      hora: 48,
      peru: 51,
      argentina: 51,
      brasil: 51,
      chile: 51,
      panama: 51,
      dominicana: 51,
      usa: 51,
      españa: 51,
      ecuador: 51,
      mexico: 51,
      bolivia: 51,
    };

    const drawTextWithStroke = (text, x, y, fontSize = 48, strokeWidth = 4) => {
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.lineWidth = strokeWidth;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    };

    const numeros = extractedData || {};

    const obtenerFechaHoraVenezuela = () => {
      const ahora = new Date();
      const fechaVenezuela = new Date(
        ahora.toLocaleString("en-US", { timeZone: "America/Caracas" })
      );
      let horaAjustada = fechaVenezuela.getHours();
      let minutosAjustados = fechaVenezuela.getMinutes();

      if (horaAjustada > 12) {
        horaAjustada = horaAjustada - 12;
      } else if (horaAjustada === 0) {
        horaAjustada = 12;
      }

      return {
        dia: String(fechaVenezuela.getDate()).padStart(2, "0"),
        mes: String(fechaVenezuela.getMonth() + 1).padStart(2, "0"),
        anio: String(fechaVenezuela.getFullYear()),
        hora: String(horaAjustada).padStart(2, "0"),
        minutos: String(minutosAjustados).padStart(2, "0"),
      };
    };

    const fechaHora =
      numeros?.fecha?.dia && numeros?.fecha?.mes
        ? numeros.fecha
        : obtenerFechaHoraVenezuela();

    const fechaTexto = `${fechaHora.dia}/${fechaHora.mes}/${fechaHora.anio || "2025"
      }`;
    drawTextWithStroke(
      fechaTexto,
      coordinates.fecha.x,
      coordinates.fecha.y,
      customSizes.fecha
    );

    const horaTexto = `${fechaHora.hora}:${fechaHora.minutos}`;
    drawTextWithStroke(
      horaTexto,
      coordinates.hora.x,
      coordinates.hora.y,
      customSizes.hora
    );

    const tasasMapping = {
      peru: numeros?.tasaColombiaPeru || dataColombia?.PERU || "No disponible",
      argentina: numeros?.tasaColombiaArgentina || dataColombia?.ARGENTINA || "No disponible",
      brasil: numeros?.tasaColombiaBrasil || dataColombia?.BRASIL || "No disponible",
      chile: numeros?.tasaColombiaChile || dataColombia?.CHILE || "No disponible",
      panama: numeros?.tasaColombiaPanama || dataColombia?.PANAMA || "No disponible",
      dominicana: numeros?.tasaColombiaDominicana || dataColombia?.DOMINICANA || "No disponible",
      usa: numeros?.tasaColombiaUSA || "No disponible",
      españa: numeros?.tasaColombiaEspaña || "No disponible",
      ecuador: numeros?.tasaColombiaEcuador || dataColombia?.ECUADOR || "No disponible",
      mexico: numeros?.tasaColombiaMexico || dataColombia?.MEXICO || "No disponible",
      bolivia: numeros?.tasaColombiaBolivia || dataColombia?.BOLIVIA || "No disponible",
    };

    Object.entries(tasasMapping).forEach(([pais, tasa]) => {
      if (tasa && coordinates[pais]) {
        const fontSize = customSizes[pais] || 48;
        drawTextWithStroke(
          String(tasa),
          coordinates[pais].x,
          coordinates[pais].y,
          fontSize,
          6
        );
      }
    });

    const buffer = canvas.toBuffer("image/jpeg", { quality: 0.9 });

    return new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          folder: "processed_rates_images",
          resource_type: "image",
          format: "jpg",
          public_id: `rates_colombia_${Date.now()}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  } catch (error) {
    console.error("Error procesando imagen Colombia:", error);
    throw error;
  }
}
