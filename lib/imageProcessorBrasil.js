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
  colombia: { x: 492, y: 478 },
  argentina: { x: 492, y: 654 },
  peru: { x: 492, y: 807 },
  chile: { x: 505, y: 987 },
  panama: { x: 491, y: 1150 },
  dominicana: { x: 480, y: 1329 },
  usa: { x: 1235, y: 485 },
  españa: { x: 1235, y: 670 },
  ecuador: { x: 1235, y: 820 },
  mexico: { x: 1235, y: 994 },
  bolivia: { x: 1235, y: 1153 },
};

// TODO: Reemplazar con el enlace correcto de Cloudinary de la plantilla base de BRASIL
const baseImageUrl =
  "https://res.cloudinary.com/dvh3nrsun/image/upload/v1781115458/7_yy7nxj.png";

export async function createImageWithRatesBrasil(dataBrasil, extractedData) {
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
      colombia: 51,
      argentina: 51,
      peru: 51,
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
      colombia: numeros?.tasaBrasilColombia || dataBrasil?.COLOMBIA || "No disponible",
      argentina: numeros?.tasaBrasilArgentina || dataBrasil?.ARGENTINA || "No disponible",
      peru: numeros?.tasaBrasilPeru || dataBrasil?.PERU || "No disponible",
      chile: numeros?.tasaBrasilChile || dataBrasil?.CHILE || "No disponible",
      panama: numeros?.tasaBrasilPanama || dataBrasil?.PANAMA || "No disponible",
      dominicana: numeros?.tasaBrasilDominicana || dataBrasil?.DOMINICANA || "No disponible",
      usa: numeros?.tasaBrasilUSA || "No disponible",
      españa: numeros?.tasaBrasilEspaña || "No disponible",
      ecuador: numeros?.tasaBrasilEcuador || dataBrasil?.ECUADOR || "No disponible",
      mexico: numeros?.tasaBrasilMexico || dataBrasil?.MEXICO || "No disponible",
      bolivia: numeros?.tasaBrasilBolivia || dataBrasil?.BOLIVIA || "No disponible",
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
          public_id: `rates_brasil_${Date.now()}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  } catch (error) {
    console.error("Error procesando imagen Brasil:", error);
    throw error;
  }
}
