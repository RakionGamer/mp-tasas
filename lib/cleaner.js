
export function limpiarTextoTasasAvanzado(texto) {
  if (!texto) return "";
  let textoNormalizado = texto
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const patrones = [
    /TASA\s*DEL\s*DIA/gi,
    /BBVA\s*Banesco\s*Mercantile\s*Bank\s*BNC\s*Banco\s*de\s*Venezuela/gi,
    /R\s*PLUS\s*REMESAS/gi,
    /\(\s*oPlusremesas/gi,
    /\b(?:am|AM|pm|PM)\b/g,
    /\*\s*\d+/g,
    /BBVA\s*\d+\s*&\s*Banesco/gi,
  ];

  let textoLimpio = textoNormalizado;
  patrones.forEach((patron) => {
    textoLimpio = textoLimpio.replace(patron, "");
  });

  textoLimpio = textoLimpio.replace(/\s+/g, " ").trim();
  return textoLimpio;
}

// ===============================================
// 🔹 APLICAR CONFIGURACIÓN SEGÚN TIPO DE ENVÍO
// ===============================================
function aplicarConfiguracion(tasas, configuracion) {
  const resultado = {
    tasaChile: null,
    tasaPeru: null,
    tasaColombia: null,
    tasaEspaña: null,
    tasaArgentina: null,
    tasaUSA: null,
    tasaMexico: null,
    tasaBrasil: null,
    tasaPanama: null,
    tasaChilePeru: null,
    tasaChileArgentina: null,
    tasaChileMexico: null,
    tasaChileBrasil: null,
    tasaChilePanama: null,
    tasaChileColombia: null,
    tasaChileEspaña: null,
    tasaChileEcuador: null,
    tasaChileUSA: null,
    tasaChileChile: null,
    tasaMexicoPeru: null,
    tasaMexicoArgentina: null,
    tasaMexicoChile: null,
    tasaMexicoBrasil: null,
    tasaMexicoPanama: null,
    tasaMexicoColombia: null,
    tasaMexicoEspaña: null,
    tasaMexicoEcuador: null,
    tasaMexicoUSA: null,
    tasaVenezuelaChile: null,
    tasaVenezuelaPeru: null,
    tasaVenezuelaArgentina: null,
    tasaVenezuelaBrasil: null,
    tasaVenezuelaColombia: null,
    tasaVenezuelaEspaña: null,
    tasaVenezuelaEcuador: null,
    tasaVenezuelaMexico: null,
    speed: null,
    tasasP: null,
  };

  Object.keys(resultado).forEach((pais) => {
    const indice = configuracion[pais];
    if (indice !== undefined && indice < tasas.length) {
      resultado[pais] = tasas[indice];
    }
  });

  return resultado;
}

// ===============================================
// 🔹 FUNCIÓN PRINCIPAL DE EXTRACCIÓN DE NÚMEROS
// ===============================================
export function extraerNumerosAvanzado(textoLimpio) {
  if (!textoLimpio) {
    const ahora = new Date();
    const fechaVenezuela = new Date(
      ahora.toLocaleString("en-US", { timeZone: "America/Caracas" })
    );
    let horaAjustada = fechaVenezuela.getHours();
    let minutosAjustados = fechaVenezuela.getMinutes();
    if (horaAjustada < 12) {
      horaAjustada = 11;
      minutosAjustados = 0;
    }

    return {
      tasaChile: null,
      tasaPeru: null,
      tasaColombia: null,
      tasaEspaña: null,
      tasaArgentina: null,
      tasaUSA: null,
      tasaMexico: null,
      tasaBrasil: null,
      tasaPanama: null,
      tasaChilePeru: null,
      tasaChileArgentina: null,
      tasaChileMexico: null,
      tasaChileBrasil: null,
      tasaChilePanama: null,
      tasaChileColombia: null,
      tasaChileEspaña: null,
      tasaChileEcuador: null,
      tasaChileUSA: null,
      speed: null,
      tasasP: null,
      fecha: {
        dia: String(fechaVenezuela.getDate()).padStart(2, "0"),
        mes: String(fechaVenezuela.getMonth() + 1).padStart(2, "0"),
        anio: fechaVenezuela.getFullYear(),
        hora: String(horaAjustada).padStart(2, "0"),
        minutos: String(minutosAjustados).padStart(2, "0"),
      },
    };
  }

  const huboOcurrencia = /\bO[.,](\d+)/.test(textoLimpio);
  textoLimpio = textoLimpio.replace(/\bO[.,](\d+)/g, "0,$1");

  const fechaHoraRegex =
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+Hora\s+(\d{1,2}):(\d{2})(?:\s*(am|pm|AM|PM))?)?/i;
  const fechaMatch = textoLimpio.match(fechaHoraRegex);

  let textoSinFecha = textoLimpio
    .replace(fechaHoraRegex, " ")
    .replace(/\s+/g, " ")
    .trim();
  const numberRegex = /[0-9]+(?:[.,][0-9]+)*/g;
  let tasas = textoSinFecha.match(numberRegex) || [];

  if (huboOcurrencia) {
    const posCorregir = tasas.findIndex((t) => /^0,\d+$/.test(t));
    const delta = 0.0002;
    if (posCorregir !== -1 && tasas[posCorregir - 1]) {
      const baseValue = parseFloat(tasas[posCorregir - 1].replace(",", "."));
      const nuevoValor = baseValue + delta;
      tasas[posCorregir] = nuevoValor.toFixed(4).replace(".", ",");
    }
  }

  const resultado = validarTasasPorCantidad(tasas, textoSinFecha);

  const ahora = new Date();
  const fechaVenezuela = new Date(
    ahora.toLocaleString("en-US", { timeZone: "America/Caracas" })
  );
  let horaAjustada = fechaVenezuela.getHours();
  let minutosAjustados = fechaVenezuela.getMinutes();
  let ampm = horaAjustada >= 12 ? "PM" : "AM";
  if (horaAjustada > 12) horaAjustada -= 12;
  else if (horaAjustada === 0) horaAjustada = 12;

  let anioFull = null;
  if (fechaMatch) {
    const anioRaw = fechaMatch[3];
    anioFull = anioRaw.length === 2 ? 2000 + Number(anioRaw) : Number(anioRaw);
  }

  let hora = null,
    minutos = null;
  if (fechaMatch && fechaMatch[4] !== undefined) {
    hora = fechaMatch[4].padStart(2, "0");
    minutos = fechaMatch[5].padStart(2, "0");
    const ampm = fechaMatch[6];
    if (ampm) {
      let hh = Number(hora);
      if (/pm/i.test(ampm) && hh < 12) hh += 12;
      if (/am/i.test(ampm) && hh === 12) hh = 0;
      hora = String(hh).padStart(2, "0");
    }
  }

  return {
    ...resultado,
    fecha: {
      dia: fechaMatch?.[1]
        ? String(fechaMatch[1]).padStart(2, "0")
        : String(fechaVenezuela.getDate()).padStart(2, "0"),
      mes: fechaMatch?.[2]
        ? String(fechaMatch[2]).padStart(2, "0")
        : String(fechaVenezuela.getMonth() + 1).padStart(2, "0"),
      anio: anioFull ?? fechaVenezuela.getFullYear(),
      hora: hora ?? String(horaAjustada).padStart(2, "0"),
      minutos: minutos ?? String(minutosAjustados).padStart(2, "0"),
    },
  };
}

// ===============================================
// 🔹 NUEVA FUNCIÓN: LIMPIAR TASAS OCR (MODO ESTRICTO / RELAJADO)
// ===============================================
function limpiarTasasOCR(tasas, modoEstricto = false) {
  let tasasLimpias = tasas
    .map((t) => t.replace(".", ",").trim())
    .filter((t) => /^\d{1,4}([.,]\d{1,5})?$/.test(t));

  return tasasLimpias.filter((t) => {
    const num = parseFloat(t.replace(",", "."));
    if (isNaN(num)) return false;
    if (num <= 0) return false;

    // 🔹 Si modo estricto activo (configuración 1)
    if (modoEstricto) {
      if (num >= 1 && num <= 5 && Number.isInteger(num)) return false;
    } 

    if (num >= 5000) return false;
    return true;
  });
}

// ===============================================
// 🔹 VALIDAR TASAS SEGÚN CANTIDAD Y CONTEXTO
// ===============================================
function validarTasasPorCantidad(tasas, textoSinFecha) {
  const esCambios = /Cambio/.test(textoSinFecha);
  const esEnvioChile = /ENV[IÍ]O DESDE CHILE/.test(textoSinFecha);
  const esEnvioMexico = /ENV[IÍ]O DESDE M[EÉ]XICO/.test(textoSinFecha);
  const esEnvioVenezuela = /Env[ií]os? desde Venezuela/.test(textoSinFecha);

  const configuraciones = {
    1: {
      tasaChile: 7,
      tasaPeru: 3,
      tasaColombia: 5,
      tasaBrasil: 4,
      tasaArgentina: null,
      tasaPanama: 1,
      tasaUSA: 2,
      tasaMexico: 6,
      tasaEspaña: 0,
    },
    2: {
      tasaChile: 0,
      tasaPeru: 10,
      tasaColombia: 50,
      tasaArgentina: 20,
      tasaMexico: 59,
    },
    3: {
      tasaChilePeru: 7,
      tasaChileArgentina: 3,
      tasaChileMexico: 4,
      tasaChileBrasil: 6,
      tasaChilePanama: 1,
      tasaChileColombia: 2,
      tasaChileEspaña: 9,
      tasaChileEcuador: 8,
      tasaChileUSA: 0,
    },
    4: {
      tasaMexicoPeru: 5,
      tasaMexicoArgentina: 1,
      tasaMexicoChile: 2,
      tasaMexicoBrasil: 4,
      tasaMexicoColombia: 0,
      tasaMexicoEspaña: 9,
      tasaMexicoEcuador: 7,
    },
    5: {
      tasaVenezuelaChile: 4,
      tasaVenezuelaPeru: 7,
      tasaVenezuelaArgentina: 3,
      tasaVenezuelaColombia: 1,
      tasaVenezuelaMexico: 5,
      tasaVenezuelaEcuador: 10
    },
  };

  let configAUsar;
  if (esCambios) configAUsar = configuraciones[2];
  else if (esEnvioChile) configAUsar = configuraciones[3];
  else if (esEnvioMexico) configAUsar = configuraciones[4];
  else if (esEnvioVenezuela) configAUsar = configuraciones[5];
  else configAUsar = configuraciones[1];

  const modoEstricto = configAUsar === configuraciones[1];
  tasas = limpiarTasasOCR(tasas, modoEstricto);

  const tasasOrdenadas = tasas.sort(
    (a, b) => parseFloat(b.replace(",", ".")) - parseFloat(a.replace(",", "."))
  );

  console.log("Tasas Ordenadas: ", tasasOrdenadas);

  return aplicarConfiguracion(tasasOrdenadas, configAUsar);
}




