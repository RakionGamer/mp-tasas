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
  fecha: { x: 535, y: 255 },
  hora: { x: 974, y: 255 },
  peru: { x: 462, y: 515 },
  argentina: { x: 460, y: 695 },
  mexico: { x: 465, y: 870 },
  brasil: { x: 465, y: 1040 },
  panama: { x: 475, y: 1225 },
  colombia: { x: 1175, y: 510 },
  españa: { x: 1185, y: 695 },
  ecuador: { x: 1185, y: 870 },
  usa: { x: 1185, y: 1040 },
};

const baseImageUrl =
  "https://res.cloudinary.com/dvh3nrsun/image/upload/v1755497612/Dise-os-Multipower-Chile_uhabbi.jpg";

export async function createImageWithRatesChile(dataChile, extractedData) {
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
      panama: 51,
      colombia: 51,
      españa: 51,
      ecuador: 51,
      usa: 51,
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

      // Convertir a formato 12 horas
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

    // Si no hay fecha en los datos, usar la actual de Venezuela
    const fechaHora =
      numeros?.fecha?.dia && numeros?.fecha?.mes
        ? numeros.fecha
        : obtenerFechaHoraVenezuela();

    // Formatear y colocar la fecha
    const fechaTexto = `${fechaHora.dia}/${fechaHora.mes}/${
      fechaHora.anio || "2025"
    }`;
    drawTextWithStroke(
      fechaTexto,
      coordinates.fecha.x,
      coordinates.fecha.y,
      customSizes.fecha
    );

    // Formatear y colocar la hora
    const horaTexto = `${fechaHora.hora}:${fechaHora.minutos}`;
    drawTextWithStroke(
      horaTexto,
      coordinates.hora.x,
      coordinates.hora.y,
      customSizes.hora
    );

    const tasasMapping = {
      peru: numeros?.tasaChilePeru || dataChile?.PERU || "No disponible",
      argentina:
        numeros?.tasaChileArgentina || dataChile?.ARGENTINA || "No disponible",
      mexico: numeros?.tasaChileMexico || dataChile?.MEXICO || "No disponible",
      brasil: numeros?.tasaChileBrasil || dataChile?.BRASIL || "No disponible",
      panama: numeros?.tasaChilePanama || dataChile?.PANAMA || "No disponible",
      colombia:
        numeros?.tasaChileColombia || dataChile?.COLOMBIA || "No disponible",
      españa: numeros?.tasaChileEspaña || "No disponible",
      ecuador:
        numeros?.tasaChileEcuador || dataChile?.ECUADOR || "No disponible",
      usa: numeros?.tasaChileUSA || "No disponible",
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

    // Convertir canvas a buffer
    const buffer = canvas.toBuffer("image/jpeg", { quality: 0.9 });

    // Subir la imagen procesada a Cloudinary
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

