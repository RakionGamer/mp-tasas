import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import cloudinary from 'cloudinary';
import { createImageWithRates } from '../../../lib/imageProcessor.js';
import { createImageWithRatesChile } from '../../../lib/imageProcessorChile.js';
import { createImageWithRatesMexico } from '../../../lib/imageProcessorMexico.js';
import { createImageWithRatesVenezuela } from '../../../lib/imageProcessorVenezuela.js';
import { createImageWithRatesChileVenezuela } from '../../../lib/imageProcessorChileVenezuela.js';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);

export async function POST(req) {
  try {
    const body = await req.json();
    const chatId = body.message?.chat?.id;

    if (!chatId) {
      return new Response("Request body does not contain a chat ID.", { status: 400 });
    }

    if (body.message?.text) {
      const messageText = body.message.text;
      function procesarTasa(texto) {
        const regexTasa = /^(\d+[.,]\d+)$/;
        const match = texto.match(regexTasa);

        if (match) {
          const valorOriginal = match[1];

          let valorNormalizado = valorOriginal.replace(',', '.');
          const valorNumerico = parseFloat(valorNormalizado);

          if (isNaN(valorNumerico)) {
            return null;
          }
          const [parteEntera, parteDecimal] = valorNormalizado.split('.');
          const parteDecimalCompleta = (parteDecimal || '').padEnd(5, '0');
          const valorCompleto = `${parteEntera}.${parteDecimalCompleta}`;
          const valorCompletoNumerico = parseFloat(valorCompleto);
          const valorFormateado = valorCompleto.replace('.', ',');
          const valorConResta = valorCompletoNumerico - 0.00030;
          const valorRestaFormateado = valorConResta.toFixed(5).replace('.', ',');

          return {
            valorOriginal: valorFormateado,
            valorConResta: valorRestaFormateado,
            valorNumerico: valorCompletoNumerico
          };
        }

        return null;
      }

      const resultadoTasa = procesarTasa(messageText.trim());

      if (resultadoTasa) {
        await bot.sendMessage(chatId, "⏳ Procesando tasa... Por favor espera.");

        const ahora = new Date();
        const fechaVenezuela = new Date(ahora.toLocaleString("en-US", { timeZone: "America/Caracas" }));
        let horaAjustada = fechaVenezuela.getHours();
        let minutosAjustados = fechaVenezuela.getMinutes();
        let Lunes = fechaVenezuela.getDay() === 1;
        let ampm = horaAjustada >= 12 ? 'PM' : 'AM';
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
              dia: String(fechaVenezuela.getDate()).padStart(2, '0'),
              mes: String(fechaVenezuela.getMonth() + 1).padStart(2, '0'),
              anio: String(fechaVenezuela.getFullYear()),
              hora: String(horaAjustada).padStart(2, '0'),
              minutos: String(minutosAjustados).padStart(2, '0'),
            }
          }
        };
        const processedImageUrlChile = await createImageWithRatesChileVenezuela(tasasVenezuela);
        await bot.sendPhoto(chatId, processedImageUrlChile, {
          caption: `Tasa procesada correctamente✅`
        });

        return new Response("ok", { status: 200 });
      } else {
        await bot.sendMessage(chatId, "👋 Hola! Envíame una imagen y te extraigo las tasas, o escribe una tasa como '0,18500' para procesarla.");
        return new Response("ok", { status: 200 });
      }
    }

    if (body.message?.photo) {
      await bot.sendMessage(chatId, "⏳ Procesando imagen... Por favor espera.");
      const fileId = body.message.photo.pop().file_id;
      const fileUrl = await getFileUrl(fileId);
      const imageBuffer = await downloadImageFromTelegram(fileUrl);
      const cloudinaryUrl = await uploadToCloudinary(imageBuffer);
      const res = await fetch(`https://mp-tasas.vercel.app/api/ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cloudinaryUrl }),
      });

      const data = await res.json();
      const texto = data.textoLimpio;
      
      console.log('Texto limpio: ', texto)
      const esCambios = /Cambios/.test(texto);
      const esEnvioChile = /ENVIO DESDE CHILE/.test(texto);
      const esEnvioChilexd = /ENVÍO DESDE CHILE/.test(texto);
      const esEnvioChileTildexdd = /ENVIO DESDE CHÍLE/.test(texto);
      const esEnvioChileTilde = /ENVÍO DESDE CHÍLE/.test(texto);


      const esEnvioMexico = /ENVIO DESDE MEXICO/.test(texto);
      const esEnvioMexicoSinTilde = /ENVÍO DESDE MÉXICO/.test(texto);
      const esEnvioMexicoSinTildexd = /ENVÍO DESDE MEXICO/.test(texto);
      const esEnvioMexicoSinTildexdd = /ENVIO DESDE MÉXICO/.test(texto);


      const esEnvioVenezuela = /Envios desde Venezuela/.test(texto);
      const esUsuarioPlus = /@Plusremesas/.test(texto);
      
      

      console.log('Con tilde: ', esEnvioMexico);
      console.log('Sin tilde: ', esEnvioMexicoSinTilde)



      if (esCambios) {
        const processedImageUrl = await createImageWithRates(data);
        const processedImageUrlChile = await createImageWithRatesChile(data);
        const processedImageUrlMexico = await createImageWithRatesMexico(data);
        const processedImageUrlVenezuela = await createImageWithRatesVenezuela(data);
        /*

        await bot.sendPhoto(chatId, processedImageUrlVenezuela, {
          caption: '✅Tasas de cambio actualizadas. Envíos desde Venezuela a'
        });

        

        await bot.sendPhoto(chatId, processedImageUrlMexico, {
          caption: '✅Tasas de cambio actualizadas. Envíos desde Mexico a'
        });
        await bot.sendPhoto(chatId, processedImageUrl, {
          caption: '✅Tasas de cambio actualizadas. Envíos a Venezuela desde'
        });*/

        await bot.sendPhoto(chatId, processedImageUrlChile, {
          caption: '✅Tasas de cambio actualizadas. Envíos desde Chile a'
        }


      } else if ((esEnvioChile || esEnvioChileTilde || esEnvioChileTildexdd || esEnvioChilexd) && esUsuarioPlus) {
        const processedImageUrlChile = await createImageWithRatesChile(data);
        await bot.sendPhoto(chatId, processedImageUrlChile, {
          caption: '✅Tasas de cambio actualizadas. Envíos desde Chile a'
        });

      } else if ((esEnvioMexico || esEnvioMexicoSinTilde || esEnvioMexicoSinTildexd || esEnvioMexicoSinTildexdd) && esUsuarioPlus) {
        const processedImageUrlMexico = await createImageWithRatesMexico(data);
        await bot.sendPhoto(chatId, processedImageUrlMexico, {
          caption: '✅Tasas de cambio actualizadas. Envíos desde Mexico a'
        });

      } else if (esEnvioVenezuela) {
        const processedImageUrlVenezuela = await createImageWithRatesVenezuela(data);
        await bot.sendPhoto(chatId, processedImageUrlVenezuela, {
          caption: '✅Tasas de cambio actualizadas. Envíos desde Venezuela a'
        });
      } else {
        const processedImageUrl = await createImageWithRates(data);
        await bot.sendPhoto(chatId, processedImageUrl, {
          caption: '✅Tasas de cambio actualizadas. Envíos a Venezuela desde'
        });
      }

      return new Response("ok", { status: 200 });
    }

    return new Response("ok", { status: 200 });

  } catch (err) {
    console.error("Bot error:", err);
    return new Response("error", { status: 500 });
  }
}

async function getFileUrl(fileId) {
  const res = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
  const data = await res.json();
  const filePath = data?.result?.file_path;
  if (!filePath) {
    throw new Error("Failed to get file path from Telegram API.");
  }
  return `https://api.telegram.org/file/bot${token}/${filePath}`;
}

async function downloadImageFromTelegram(fileUrl) {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Error downloading image: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function uploadToCloudinary(imageBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'telegram_bot_images',
        resource_type: 'image',
        format: 'jpg'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(imageBuffer);
  });
}


