import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OCR_API_URL = process.env.OCR_API_URL;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (!msg.photo) {
    bot.sendMessage(chatId, "📸 Por favor envíame una imagen de las tasas.");
    return;
  }

  try {
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${file.file_path}`;
    const res = await fetch(OCR_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: fileUrl })
    });
    if (!res.ok) throw new Error("Error en OCR API");
    const data = await res.json();
    const tasas = `
💱 Tasas detectadas:
🇨🇱 Chile: ${data.tasaChile}
🇵🇪 Perú: ${data.tasaPeru}
🇨🇴 Colombia: ${data.tasaColombia}
🇪🇸 España: ${data.tasaEspaña}
🇺🇸 USA: ${data.tasaUSA}
🇲🇽 México: ${data.tasaMexico}
🇧🇷 Brasil: ${data.tasaBrasil}
🇵🇦 Panamá: ${data.tasaPanama}
📅 Fecha: ${data.fecha.dia}/${data.fecha.mes}/${data.fecha.anio} ${data.fecha.hora}:${data.fecha.minutos}
    `;
    bot.sendMessage(chatId, tasas.trim());
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "❌ Hubo un error procesando la imagen.");
  }
});


