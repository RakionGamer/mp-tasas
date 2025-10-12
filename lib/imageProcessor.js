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
  fecha: { x: 300, y: 250 },
  hora: { x: 215, y: 325 },
  chile: { x: 425, y: 431 },
  pagoMovil: { x: 479, y: 500 },
  peru: { x: 429, y: 623 },
  colombia: { x: 459, y: 790 },
  argentina: { x: 421, y: 960 },
  mexico: { x: 421, y: 1140 },
  usa: { x: 1155, y: 460 },
  panama: { x: 1155, y: 639 },
  brasil: { x: 1155, y: 795 },
  espana: { x: 1155, y: 965 },
};

const baseImageUrl =
  "https://res.cloudinary.com/dvh3nrsun/image/upload/v1755497438/A_venezuela_desde_uaxz4u.jpg";

export async function createImageWithRates(paisesVenezuela, extractedData) {
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
      chile: 51,
      pagoMovil: 51,
      peru: 54,
      colombia: 51,
      argentina: 51,
      mexico: 51,
      usa: 51,
      panama: 52,
      brasil: 52,
      espana: 52,
    };

    const drawTextWithStroke = (text, x, y, fontSize = 48, strokeWidth = 4) => {
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.lineWidth = strokeWidth;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    };

    const numeros = extractedData?.numeros || {};

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

    const numberColombia = numeros?.tasaColombia
      ? numeros.tasaColombia + "÷"
      : null;
    const numberUsa = numeros?.tasaUSA ? numeros.tasaUSA + "÷" : null;

    const tasasMapping = {
      chile:
        numeros?.tasaChile ||
        paisesVenezuela?.CHILE?.VENEZUELA ||
        "No disponible",
      peru:
        numeros?.tasaPeru ||
        paisesVenezuela?.PERU?.VENEZUELA ||
        "No disponible",
      colombia:
        numberColombia ||
        paisesVenezuela?.COLOMBIA?.VENEZUELA ||
        "No disponible",
      argentina:
        numeros?.tasaArgentina ||
        paisesVenezuela?.ARGENTINA?.VENEZUELA ||
        "Consultar",
      mexico:
        numeros?.tasaMexico ||
        paisesVenezuela?.MEXICO?.VENEZUELA ||
        "No disponible",
      usa: numberUsa || "No disponible",
      panama: numeros?.tasaPanama || "No disponible",
      brasil:
        numeros?.tasaArgentna ||
        paisesVenezuela?.BRASIL?.VENEZUELA ||
        "No disponible",
      espana: numeros?.tasaEspaña || "No disponible",
    };

    const calcularTasaCompra = (tasaVenta) => {
      if (!tasaVenta) return null;
      const numeroDecimal = parseFloat(tasaVenta.replace(",", "."));
      const tasaCompra = numeroDecimal - 0.0003;
      return tasaCompra.toFixed(5).replace(".", ",");
    };

    const tasaPagoMovil = calcularTasaCompra(
      numeros?.tasaChile || paisesVenezuela?.CHILE?.PM
    );

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

    if (tasaPagoMovil && coordinates.pagoMovil) {
      drawTextWithStroke(
        tasaPagoMovil,
        coordinates.pagoMovil.x,
        coordinates.pagoMovil.y,
        customSizes.pagoMovil
      );
    }

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
