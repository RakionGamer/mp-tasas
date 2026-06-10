import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import cloudinary from "cloudinary";
import { createImageWithRates } from "@/lib/imageProcessor.js";
import { createImageWithRatesChile } from "@/lib/imageProcessorChile.js";
import { createImageWithRatesMexico } from "@/lib/imageProcessorMexico.js";
import { createImageWithRatesVenezuela } from "@/lib/imageProcessorVenezuela.js";
import { createImageWithRatesChileVenezuela } from "@/lib/imageProcessorChileVenezuela.js";
import { createImageWithRatesBrasil } from "@/lib/imageProcessorBrasil.js";
import { createImageWithRatesPeru } from "@/lib/imageProcessorPeru.js";
import { createImageWithRatesColombia } from "@/lib/imageProcessorColombia.js";
import { getRates } from "@/lib/harryTasas.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);

export async function POST(req) {
  let chatId;
  try {
    const rates = await getRates();
    const ecuadorRates = rates["DESDE ECUADOR"];
    const mexicoRates = rates["DESDE MEXICO"];
    const venezuelaRates = rates["DESDE VENEZUELA"];
    const peruRates = rates["DESDE PERU"];
    const chileRates = rates["DESDE CHILE"];
    const argentinaRates = rates["DESDE ARGENTINA"];
    const brasilRates = rates["DESDE BRASIL"];
    const colombiaRates = rates["DESDE COLOMBIA"];

    const paisesAVenezuela = {
      CHILE: {
        VENEZUELA: chileRates["VENEZUELA"],
        PM: chileRates["PM"],
      },
      ARGENTINA: {
        VENEZUELA: argentinaRates["VENEZUELA"],
        PM: argentinaRates["PM"],
      },
      ECUADOR: {
        VENEZUELA: ecuadorRates["VENEZUELA"],
        PM: ecuadorRates["PM"],
      },
      COLOMBIA: {
        VENEZUELA: colombiaRates["VENEZUELA"],
        PM: colombiaRates["PM"],
      },
      PERU: {
        VENEZUELA: peruRates["VENEZUELA"],
        PM: peruRates["PM"],
      },
      MEXICO: {
        VENEZUELA: mexicoRates["VENEZUELA"],
        PM: mexicoRates["PM"],
      },
      BRASIL: {
        VENEZUELA: brasilRates["VENEZUELA"],
        PM: brasilRates["PM"],
      },
    };

    const body = await req.json();
    chatId = body.message?.chat?.id;

    if (!chatId) {
      return new Response("Request body does not contain a chat ID.", {
        status: 400,
      });
    }

    const keyboard = {
      reply_markup: {
        keyboard: [[{ text: "⚡ Generar Tasas Speed" }]],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    };

    if (body.message?.text === "⚡ Generar Tasas Speed") {
      await bot.sendMessage(chatId, "⚡ Generando tasas Speed...", keyboard);
      const processedImageUrl = await createImageWithRates(
        paisesAVenezuela,
        {}
      );
      await bot.sendPhoto(chatId, processedImageUrl, {
        caption: "✅ Tasas actualizadas. Envíos a Venezuela desde",
        ...keyboard,
      });

      const processedImageUrlChile = await createImageWithRatesChile(
        chileRates,
        {}
      );
      await bot.sendPhoto(chatId, processedImageUrlChile, {
        caption: "✅ Tasas actualizadas. Envíos desde Chile a",
        ...keyboard,
      });

      const processedImageUrlMexico = await createImageWithRatesMexico(
        mexicoRates,
        {}
      );
      await bot.sendPhoto(chatId, processedImageUrlMexico, {
        caption: "✅ Tasas actualizadas. Envíos desde México a",
        ...keyboard,
      });
      const processedImageUrlVenezuela = await createImageWithRatesVenezuela(
        venezuelaRates,
        {}
      );

      await bot.sendPhoto(chatId, processedImageUrlVenezuela, {
        caption: "✅ Tasas actualizadas. Envíos desde Venezuela a",
        ...keyboard,
      });

      const processedImageUrlBrasil = await createImageWithRatesBrasil(
        brasilRates,
        {}
      );
      await bot.sendPhoto(chatId, processedImageUrlBrasil, {
        caption: "✅ Tasas actualizadas. Envíos desde Brasil a",
        ...keyboard,
      });

      const processedImageUrlPeru = await createImageWithRatesPeru(
        peruRates,
        {}
      );
      await bot.sendPhoto(chatId, processedImageUrlPeru, {
        caption: "✅ Tasas actualizadas. Envíos desde Peru a",
        ...keyboard,
      });

      const processedImageUrlColombia = await createImageWithRatesColombia(
        colombiaRates,
        {}
      );
      await bot.sendPhoto(chatId, processedImageUrlColombia, {
        caption: "✅ Tasas actualizadas. Envíos desde Colombia a",
        ...keyboard,
      });

      return new Response("ok", { status: 200 });
    }

    if (body.message?.text) {
      try {
        const messageText = body.message.text;
        function procesarTasa(texto) {
          const regexTasa = /^(\d+[.,]\d+)$/;
          const match = texto.match(regexTasa);
          if (match) {
            const valorOriginal = match[1];
            let valorNormalizado = valorOriginal.replace(",", ".");
            const valorNumerico = parseFloat(valorNormalizado);
            if (isNaN(valorNumerico)) return null;
            const [parteEntera, parteDecimal] = valorNormalizado.split(".");
            const parteDecimalCompleta = (parteDecimal || "").padEnd(5, "0");
            const valorCompleto = `${parteEntera}.${parteDecimalCompleta}`;
            const valorCompletoNumerico = parseFloat(valorCompleto);
            const valorFormateado = valorCompleto.replace(".", ",");
            const valorConResta = valorCompletoNumerico - 0.0003;
            const valorRestaFormateado = valorConResta
              .toFixed(5)
              .replace(".", ",");
            return {
              valorOriginal: valorFormateado,
              valorConResta: valorRestaFormateado,
              valorNumerico: valorCompletoNumerico,
            };
          }
          return null;
        }

        const resultadoTasa = procesarTasa(messageText.trim());

        if (resultadoTasa) {
          await bot.sendMessage(
            chatId,
            "⏳ Procesando tasa... Por favor espera.",
            keyboard
          );

          const ahora = new Date();
          const fechaVenezuela = new Date(
            ahora.toLocaleString("en-US", { timeZone: "America/Caracas" })
          );
          let horaAjustada = fechaVenezuela.getHours();
          let minutosAjustados = fechaVenezuela.getMinutes();
          let ampm = horaAjustada >= 12 ? "PM" : "AM";
          if (horaAjustada > 12) {
            horaAjustada = horaAjustada - 12;
          } else if (horaAjustada === 0) {
            horaAjustada = 12;
          }

          const tasasVenezuela = {
            valorOriginal: resultadoTasa.valorOriginal,
            valorConResta: resultadoTasa.valorConResta,
            numeros: {
              fecha: {
                dia: String(fechaVenezuela.getDate()).padStart(2, "0"),
                mes: String(fechaVenezuela.getMonth() + 1).padStart(2, "0"),
                anio: String(fechaVenezuela.getFullYear()),
                hora: String(horaAjustada).padStart(2, "0"),
                minutos: String(minutosAjustados).padStart(2, "0"),
              },
            },
          };

          const processedImageUrlChile =
            await createImageWithRatesChileVenezuela(tasasVenezuela);
          await bot.sendPhoto(chatId, processedImageUrlChile, {
            caption: `Tasa procesada correctamente ✅`,
            ...keyboard,
          });
        } else {
          await bot.sendMessage(
            chatId,
            "👋 Hola! Envíame una imagen o escribe una tasa como '0,18500' para procesarla.",
            keyboard
          );
        }
      } catch (err) {
        console.error("Error procesando mensaje de texto:", err);
        await bot.sendMessage(
          chatId,
          "⚠️ Ocurrió un error procesando tu tasa. Intenta de nuevo.",
          keyboard
        );
      }

      return new Response("ok", { status: 200 });
    }

    // === PROCESAR IMÁGENES ===
    if (body.message?.photo) {
      try {
        await bot.sendMessage(
          chatId,
          "⏳ Procesando imagen... Por favor espera.",
          keyboard
        );

        const fileId = body.message.photo.pop().file_id;
        const fileUrl = await getFileUrl(fileId);
        const imageBuffer = await downloadImageFromTelegram(fileUrl);
        const cloudinaryUrl = await uploadToCloudinary(imageBuffer);

        const res = await fetch(`https://mp-tasas.vercel.app/api/ocr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: cloudinaryUrl }),
        });

        if (!res.ok) throw new Error(`OCR API error: ${res.status}`);
        const data = await res.json();
        const otrosTextos = data.tasasValidadas?.otros_textos || [];
        const texto = otrosTextos.join(" ");

        console.log('Datos extraídos: ', data);

        console.log("Textos encontrados:", texto);

        const esCambios = /Cambio/i.test(texto);
        const esEnvioChile = /ENV[IÍ]O DESDE CHILE/i.test(texto);
        const esEnvioMexico = /ENV[IÍ]O DESDE M[EÉ]XICO/i.test(texto);
        const esEnvioVenezuela = /Env[ií]os? desde Venezuela/i.test(texto);
        const esEnvioBrasil = /ENV[IÍ]O DESDE BRASIL/i.test(texto);
        const esEnvioPeru = /ENV[IÍ]O DESDE PER[UÚ]/i.test(texto);
        const esEnvioColombia = /ENV[IÍ]O DESDE COLOMBIA/i.test(texto);

        if (esCambios || esEnvioChile) {
          const processedImageUrlChile = await createImageWithRatesChile(
            {},
            data.tasasValidadas
          );
          await bot.sendPhoto(chatId, processedImageUrlChile, {
            caption: "✅ Tasas actualizadas. Envíos desde Chile a",
            ...keyboard,
          });
        } else if (esEnvioMexico) {
          const processedImageUrlMexico = await createImageWithRatesMexico(
            {},
            data.tasasValidadas
          );
          await bot.sendPhoto(chatId, processedImageUrlMexico, {
            caption: "✅ Tasas actualizadas. Envíos desde México a",
            ...keyboard,
          });
        } else if (esEnvioVenezuela) {
          const processedImageUrlVenezuela =
            await createImageWithRatesVenezuela({}, data.tasasValidadas);
          await bot.sendPhoto(chatId, processedImageUrlVenezuela, {
            caption: "✅ Tasas actualizadas. Envíos desde Venezuela a",
            ...keyboard,
          });
        } else if (esEnvioBrasil) {
          const processedImageUrlBrasil = await createImageWithRatesBrasil(
            {},
            data.tasasValidadas
          );
          await bot.sendPhoto(chatId, processedImageUrlBrasil, {
            caption: "✅ Tasas actualizadas. Envíos desde Brasil a",
            ...keyboard,
          });
        } else if (esEnvioPeru) {
          const processedImageUrlPeru = await createImageWithRatesPeru(
            {},
            data.tasasValidadas
          );
          await bot.sendPhoto(chatId, processedImageUrlPeru, {
            caption: "✅ Tasas actualizadas. Envíos desde Peru a",
            ...keyboard,
          });
        } else if (esEnvioColombia) {
          const processedImageUrlColombia = await createImageWithRatesColombia(
            {},
            data.tasasValidadas
          );
          await bot.sendPhoto(chatId, processedImageUrlColombia, {
            caption: "✅ Tasas actualizadas. Envíos desde Colombia a",
            ...keyboard,
          });
        } else {
          const processedImageUrl = await createImageWithRates(
            {},
            data.tasasValidadas
          );
          await bot.sendPhoto(chatId, processedImageUrl, {
            caption: "✅ Tasas actualizadas. Envíos a Venezuela desde",
            ...keyboard,
          });
        }
      } catch (err) {
        console.error("Error procesando imagen:", err);
        await bot.sendMessage(
          chatId,
          "⚠️ Ocurrió un error procesando tu imagen. Intenta de nuevo.",
          keyboard
        );
      }

      return new Response("ok", { status: 200 });
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Bot error general:", err);
    try {
      if (chatId) {
        await bot.sendMessage(
          chatId,
          "⚠️ Hubo un error inesperado. Intenta más tarde."
        );
      }
    } catch (e) {
      console.error("Error extra al notificar:", e);
    }
    return new Response("ok", { status: 200 });
  }
}

// === HELPERS ===
async function getFileUrl(fileId) {
  const res = await fetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
  );
  const data = await res.json();
  const filePath = data?.result?.file_path;
  if (!filePath) throw new Error("Failed to get file path from Telegram API.");
  return `https://api.telegram.org/file/bot${token}/${filePath}`;
}

async function downloadImageFromTelegram(fileUrl) {
  const response = await fetch(fileUrl);
  if (!response.ok)
    throw new Error(`Error downloading image: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function uploadToCloudinary(imageBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "telegram_bot_images",
        resource_type: "image",
        format: "jpg",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(imageBuffer);
  });
}
