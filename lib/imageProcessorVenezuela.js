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
  fecha: { x: 490, y: 229 },
  hora: { x: 952, y: 229 },
  mexico: { x: 470, y: 840 },
  argentina: { x: 470, y: 675 },
  brasil: { x: 470, y: 1023 },
  chile: { x: 470, y: 500 },
  colombia: { x: 1200, y: 500 },
  españa: { x: 1200, y: 675 },
  ecuador: { x: 1205, y: 840 },
  peru: { x: 1205, y: 1023 },
};

const baseImageUrl =
  "https://res.cloudinary.com/dvh3nrsun/image/upload/v1755497439/Desde_Venezuela_xselui.jpg";

export async function createImageWithRatesVenezuela(
  dataVenezuela,
  extractedData
) {
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

    
    console.log("extractedData recibido:", extractedData);

    
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

    
    const extraerFechaDeTextos = () => {
      const otrosTextos = extractedData?.otros_textos || [];
      const textoCompleto = otrosTextos.join(" ");

      
      const matchFecha = textoCompleto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      
      const matchHora = textoCompleto.match(/(\d{1,2}):(\d{2})/);

      if (matchFecha || matchHora) {
        const fechaActual = obtenerFechaHoraVenezuela();
        return {
          dia: matchFecha ? matchFecha[1].padStart(2, "0") : fechaActual.dia,
          mes: matchFecha ? matchFecha[2].padStart(2, "0") : fechaActual.mes,
          anio: matchFecha ? matchFecha[3] : fechaActual.anio,
          hora: matchHora ? matchHora[1].padStart(2, "0") : fechaActual.hora,
          minutos: matchHora ? matchHora[2] : fechaActual.minutos,
        };
      }

      return null;
    };

    
    const fechaHora = extraerFechaDeTextos() || obtenerFechaHoraVenezuela();

    
    const fechaTexto = `${fechaHora.dia}/${fechaHora.mes}/${fechaHora.anio}`;
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
      peru:
        extractedData?.tasaVenezuelaPeru ||
        dataVenezuela?.PERU ||
        "No disponible",
      argentina:
        extractedData?.tasaVenezuelaArgentina ||
        dataVenezuela?.ARGENTINA ||
        "No disponible",
      brasil: extractedData?.tasaVenezuelaBrasil || "Consultar",
      chile:
        extractedData?.tasaVenezuelaChile ||
        dataVenezuela?.CHILE ||
        "No disponible",
      mexico:
        extractedData?.tasaVenezuelaMexico ||
        dataVenezuela?.MEXICO ||
        "No disponible",
      colombia:
        extractedData?.tasaVenezuelaColombia ||
        dataVenezuela?.COLOMBIA ||
        "No disponible",
      españa: extractedData?.tasaVenezuelaEspaña || "Consultar",
      ecuador:
        extractedData?.tasaVenezuelaEcuador ||
        dataVenezuela?.ECUADOR ||
        "No disponible",
    };

    console.log("Tasas a dibujar:", tasasMapping);

    Object.entries(tasasMapping).forEach(([pais, tasa]) => {
      if (tasa && coordinates[pais]) {
        const fontSize = customSizes[pais] || 48;
        const strokeWidth = pais === "peru" ? 4 : 6;
        drawTextWithStroke(
          String(tasa),
          coordinates[pais].x,
          coordinates[pais].y,
          fontSize,
          strokeWidth
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
          public_id: `rates_venezuela_${Date.now()}`,
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



