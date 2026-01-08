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
  fecha: { x: 539, y: 203 },
  hora: { x: 997, y: 203 }, 

  peru: { x: 495, y: 489 },
  argentina: { x: 495, y: 650 },
  brasil: { x: 495, y: 805 },
  chile: { x: 495, y: 997 },

  colombia: { x: 1230, y: 489 },
  españa: { x: 1230, y: 645 }, 
  ecuador: { x: 1230, y: 840 }, 
};

const baseImageUrl =
  "https://res.cloudinary.com/dvh3nrsun/image/upload/v1755497439/Desde_Mexico_j3fxjf.jpg";

export async function createImageWithRatesMexico(dataMexico, extractedData) {
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
      mexico: 51,
      brasil: 51,
      colombia: 51,
      españa: 51,
      ecuador: 51,
      chile: 51,
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

    const fechaTexto = `${fechaHora.dia}/${fechaHora.mes}/${
      fechaHora.anio || "2025"
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
      peru: numeros?.tasaMexicoPeru || dataMexico?.PERU || "No disponible",
      argentina: numeros?.tasaMexicoArgentina || dataMexico?.ARGENTINA || "No disponible",
      chile: numeros?.tasaMexicoChile || dataMexico?.CHILE || "No disponible",
      brasil: numeros?.tasaMexicoBrasil|| dataMexico?.BRASIL || "No disponible",
      colombia: numeros?.tasaMexicoColombia || dataMexico?.COLOMBIA || "No disponible",
      españa: numeros?.tasaMexicoEspaña || "No disponible",
      ecuador: numeros?.tasaMexicoEcuador || dataMexico?.ECUADOR || "No disponible",
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
          public_id: `rates_${Date.now()}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  } catch (error) {
    console.error("Error procesando imagen:", error);
    throw error;
  }
}


