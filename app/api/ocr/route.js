import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { validarTasasPorCantidad } from "../../../lib/cleaner";

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url)
      return NextResponse.json({ error: "No se envió URL" }, { status: 400 });

    const GEMINI_API_KEY = "AIzaSyBn7bskscJ-ZaNt3mi3ymG4hKTUVGp3t8c";
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const imageResp = await fetch(url);
    if (!imageResp.ok)
      throw new Error(`No se pudo descargar la imagen: ${imageResp.status}`);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
Eres un sistema OCR avanzado. Analiza la imagen y genera un JSON estructurado de esta forma:
{
  "tasas": {
    "<pais>": "<valor>",
    ...
  },
  "otros_textos": ["<texto extra1>", "<texto extra2>", ...]
}

Reglas obligatorias:
- "tasas" debe contener solo pares país-valor numérico (decimales completos o enteros), también qué este conformado por una coma.
- "otros_textos" incluye todo el texto que no sea una tasa (títulos, fechas, URLs, etc).
- Devuelve **únicamente JSON válido**, sin explicaciones, sin texto adicional, sin comentarios.
- Si encuentras "Estados Unidos" o "USA", usa "USA" como clave.
- Si encuentras "Brasil" o "Brazil", usa "Brasil" como clave.
`;

    const contents = [
      {
        inlineData: {
          mimeType: imageResp.headers.get("content-type") || "image/jpeg",
          data: base64,
        },
      },
      { text: prompt },
    ];

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const result = await ai.models.generateContent({
      model,
      contents,
    });

    let parsedText =
      result?.text ??
      (Array.isArray(result?.output)
        ? result.output
            .map((o) => o?.content?.map((c) => c?.text || "").join(""))
            .join("\n")
        : "");

    let jsonLimpio;
    try {
      jsonLimpio = JSON.parse(parsedText);
    } catch {
      const match = parsedText.match(/\{[\s\S]*\}/);
      jsonLimpio = match
        ? JSON.parse(match[0])
        : { tasas: {}, otros_textos: [] };
    }


    const tasasValidadas = await validarTasasPorCantidad(jsonLimpio);

    return NextResponse.json({
      tasasValidadas,
      otros_textos: jsonLimpio.otros_textos || [],
    });
  } catch (err) {
    console.error("OCR (Gemini) error:", err);
    return NextResponse.json(
      { error: err?.message || "OCR failed" },
      { status: 500 }
    );
  }
}



