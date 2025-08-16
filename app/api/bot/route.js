import fetch from "node-fetch";

const TOKEN = process.env.TELEGRAM_TOKEN;

export async function POST(req) {
  try {
    const body = await req.json();

    const chatId = body.message?.chat?.id;

    if (body.message?.text) {
      await sendMessage(chatId, "👋 Hola! Envíame una imagen y te extraigo las tasas.");
    }

    if (body.message?.photo) {
      const fileId = body.message.photo.pop().file_id;
      const fileUrl = await getFileUrl(fileId);

      // Llamamos a tu API de OCR interna
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fileUrl }),
      });

      const data = await res.json();

      await sendMessage(chatId, `📊 Tasas:\n${JSON.stringify(data, null, 2)}`);
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Bot error:", err);
    return new Response("error", { status: 500 });
  }
}

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function getFileUrl(fileId) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
  const data = await res.json();
  return `https://api.telegram.org/file/bot${TOKEN}/${data.result.file_path}`;
}
