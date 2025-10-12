import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  limpiarTextoTasasAvanzado,
  extraerNumerosAvanzado,
} from "../../../lib/cleaner";

export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url)
      return NextResponse.json({ error: "No se envió URL" }, { status: 400 });

    
    const GEMINI_API_KEY = "AIzaSyCGoa4cH1XLUe2zCYJecHbEh6ihxL6k4RY";

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const imageResp = await fetch(url);
    if (!imageResp.ok)
      throw new Error(`No se pudo descargar la imagen: ${imageResp.status}`);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // 4) Contenido: primero la imagen, luego la instrucción (coloca la instrucción DESPUÉS de la imagen)
    const contents = [
      {
        inlineData: {
          mimeType: imageResp.headers.get("content-type") || "image/jpeg",
          data: base64,
        },
      },
      {
        text: "Extrae TODO el texto de esta imagen. Devuélvelo solo como texto plano, sin explicaciones.",
      },
    ];

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const result = await ai.models.generateContent({
      model,
      contents,
    });

    const parsedText =
      result?.text ??
      (Array.isArray(result?.output)
        ? result.output
            .map((o) => o?.content?.map((c) => c?.text || "").join(""))
            .join("\n")
        : "");

    const textoLimpio = limpiarTextoTasasAvanzado(parsedText);
    const numeros = extraerNumerosAvanzado(textoLimpio);

    console.log("Numeros extraídos (Gemini):", numeros);

    return NextResponse.json({
      parsedText,
      textoLimpio,
      numeros,
      raw: result,
    });
  } catch (err) {
    console.error("OCR (Gemini) error:", err);
    return NextResponse.json(
      { error: err?.message || "OCR failed" },
      { status: 500 }
    );
  }
}
