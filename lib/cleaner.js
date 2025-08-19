// lib/cleaner.js

export function limpiarTextoTasasAvanzado(texto) {
  if (!texto) return '';
  let textoNormalizado = texto
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();


  const patrones = [
  /TASA\s*DEL\s*DIA/gi,
  /BBVA.*?Banesco.*?Banco.*?Venezuela/gi, 
  /PLUS\s*REMESAS/gi,                      
  /@Plusremesas/gi,                        
  /\b(?:am|AM|pm|PM)\b/g,
  /\*\s*\d+/g,
];


  let textoLimpio = textoNormalizado;
  patrones.forEach(patron => {
    textoLimpio = textoLimpio.replace(patron, '');
  });
  textoLimpio = textoLimpio.replace(/\s+/g, ' ').trim();
  return textoLimpio;
}


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

  Object.keys(resultado).forEach(pais => {
    const indice = configuracion[pais];
    if (indice !== undefined && indice < tasas.length) {
      resultado[pais] = tasas[indice];
    }
  });
  return resultado;
}



export function extraerNumerosAvanzado(textoLimpio) {
  if (!textoLimpio) {
    const ahora = new Date();
    const fechaVenezuela = new Date(ahora.toLocaleString("en-US", { timeZone: "America/Caracas" }));
    let horaAjustada = fechaVenezuela.getHours();
    let minutosAjustados = fechaVenezuela.getMinutes();
    if (horaAjustada < 12) {
      horaAjustada = 11;
      minutosAjustados = 0;
    }

    return {
      tasaChile: null, tasaPeru: null, tasaColombia: null, tasaEspaña: null,
      tasaArgentina: null, tasaUSA: null, tasaMexico: null, tasaBrasil: null, tasaPanama: null,
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
        dia: String(fechaVenezuela.getDate()).padStart(2, '0'),
        mes: String(fechaVenezuela.getMonth() + 1).padStart(2, '0'),
        anio: fechaVenezuela.getFullYear(),
        hora: String(horaAjustada).padStart(2, '0'),
        minutos: String(minutosAjustados).padStart(2, '0')
      },
    };
  }

  // 🔹 Paso previo: detectar si existe "O,xxx" o "O.xxx"
  const huboOcurrencia = /\bO[.,](\d+)/.test(textoLimpio);

  // 🔹 Normalizamos "O,050" → "0,050"
  textoLimpio = textoLimpio.replace(/\bO[.,](\d+)/g, '0,$1');

  const fechaHoraRegex = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+Hora\s+(\d{1,2}):(\d{2})(?:\s*(am|pm|AM|PM))?)?/i;
  const fechaMatch = textoLimpio.match(fechaHoraRegex);

  let textoSinFecha = textoLimpio.replace(fechaHoraRegex, ' ').replace(/\s+/g, ' ').trim();
  const numberRegex = /[0-9]+(?:[.,][0-9]+)*/g;
  let tasas = textoSinFecha.match(numberRegex) || [];
  if (huboOcurrencia) {
    const posCorregir = tasas.findIndex(t => /^0,\d+$/.test(t));
    const delta = 0.0002;
    if (posCorregir !== -1 && tasas[posCorregir - 1]) {
      const baseValue = parseFloat(tasas[posCorregir - 1].replace(',', '.'));
      const nuevoValor = baseValue + delta;
      tasas[posCorregir] = nuevoValor.toFixed(4).replace('.', ',');
    }
  }
  const resultado = validarTasasPorCantidad(tasas, textoSinFecha);
  const ahora = new Date();
  const fechaVenezuela = new Date(ahora.toLocaleString("en-US", { timeZone: "America/Caracas" }));
  let horaAjustada = fechaVenezuela.getHours();
  let minutosAjustados = fechaVenezuela.getMinutes();

  let ampm = horaAjustada >= 12 ? 'PM' : 'AM';
  if (horaAjustada > 12) {
    horaAjustada = horaAjustada - 12;
  } else if (horaAjustada === 0) {
    horaAjustada = 12;
  }

  let anioFull = null;
  if (fechaMatch) {
    const anioRaw = fechaMatch[3];
    if (anioRaw.length === 2) {
      const n = Number(anioRaw);
      anioFull = 2000 + n;
    } else {
      anioFull = Number(anioRaw);
    }
  }

  let hora = null, minutos = null;
  if (fechaMatch && fechaMatch[4] !== undefined) {
    hora = fechaMatch[4].padStart(2, '0');
    minutos = fechaMatch[5].padStart(2, '0');
    const ampm = fechaMatch[6];
    if (ampm) {
      let hh = Number(hora);
      if (/pm/i.test(ampm) && hh < 12) hh = hh + 12;
      if (/am/i.test(ampm) && hh === 12) hh = 0;
      hora = String(hh).padStart(2, '0');
    }
  }

  return {
    ...resultado,
    fecha: {
      dia: fechaMatch?.[1] ? String(fechaMatch[1]).padStart(2, '0') : String(fechaVenezuela.getDate()).padStart(2, '0'),
      mes: fechaMatch?.[2] ? String(fechaMatch[2]).padStart(2, '0') : String(fechaVenezuela.getMonth() + 1).padStart(2, '0'),
      anio: anioFull ?? fechaVenezuela.getFullYear(),
      hora: hora ?? String(horaAjustada).padStart(2, '0'),
      minutos: minutos ?? String(minutosAjustados).padStart(2, '0')
    }
  };
}


function validarTasasPorCantidad(tasas, textoSinFecha) {
  const esCambios = /Cambio/.test(textoSinFecha);
  const esEnvioChile = /ENVIO DESDE CHILE/.test(textoSinFecha);
  const esEnvioChileTilde = /ENVÍO DESDE CHÍLE/.test(textoSinFecha);
  const esEnvioChilexd = /ENVÍO DESDE CHILE/.test(textoSinFecha);
  const esEnvioChileTildexdd = /ENVIO DESDE CHÍLE/.test(textoSinFecha);
  const esEnvioMexico = /ENVIO DESDE MEXICO/.test(textoSinFecha);
  const esEnvioMexicoConTilde = /ENVÍO DESDE MÉXICO/.test(textoSinFecha);
  const esEnvioMexicoSinTildexd = /ENVIO DESDE MÉXICO/.test(textoSinFecha);
  const esEnvioMexicoSinTildexdd = /ENVÍO DESDE MEXICO/.test(textoSinFecha);
  const esEnvioVenezuela = /Envios desde Venezuela/.test(textoSinFecha);
  const esEnvioVenezuelaXd = /Envio desde Venezuela/.test(textoSinFecha);
  const esUsuarioPlus = /@Plusremesas/.test(textoSinFecha);



   const tasasOrdenadas = tasas.sort((a, b) => {
    const numA = parseFloat(a.replace(',', '.'));
    const numB = parseFloat(b.replace(',', '.'));
    return numA - numB;
  }).reverse();


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
      tasaEspaña: 0
    },

    2: {
      tasaChile: 0,
      tasaPeru: 10,
      tasaColombia: 50,
      tasaArgentina: 20,
      tasaEspaña: null,
      tasaUSA: null,
      tasaMexico: 59,
      tasaBrasil: 38,
      tasaPanama: null,
      tasaChilePeru: 1,
      tasaChileArgentina: 6,
      tasaChileMexico: 4,
      tasaChileBrasil: 8,
      tasaChilePanama: null,
      tasaChileColombia: 2,
      tasaChileEspaña: null,
      tasaChileEcuador: 3,
      tasaChileUSA: null,
      tasaMexicoPeru: 64,
      tasaMexicoArgentina: 61,
      tasaMexicoChile: 62,
      tasaMexicoBrasil: 63,
      tasaMexicoPanama: null,
      tasaMexicoColombia: 60,
      tasaMexicoEspaña: null,
      tasaMexicoEcuador: 66,
      tasaMexicoUSA: null,
      tasaVenezuelaChile: 32,
      tasaVenezuelaPeru: 20,
      tasaVenezuelaArgentina: 32,
      tasaVenezuelaBrasil: 37,
      tasaVenezuelaColombia: 26,
      tasaVenezuelaEspaña: null,
      tasaVenezuelaEcuador: 25,
      tasaVenezuelaMexico: 27,
    },

    3: {
      tasaChile: null,
      tasaPeru: null,
      tasaColombia: null,
      tasaEspaña: null,
      tasaArgentina: null,
      tasaUSA: null,
      tasaMexico: null,
      tasaBrasil: null,
      tasaPanama: null,
      tasaChilePeru: 7,
      tasaChileArgentina: 3,
      tasaChileMexico: 4,
      tasaChileBrasil: 6,
      tasaChilePanama: 0,
      tasaChileColombia: 2,
      tasaChileEspaña: 9,
      tasaChileEcuador: 8,
      tasaChileUSA: 1,
      speed: null,
      tasasP: true,
    },

    4: {
      tasaChile: null,
      tasaPeru: null,
      tasaColombia: null,
      tasaEspaña: null,
      tasaArgentina: null,
      tasaUSA: null,
      tasaMexico: null,
      tasaBrasil: null,
      tasaPanama: null,
      tasaMexicoPeru: 5,
      tasaMexicoArgentina: 1,
      tasaMexicoChile: 2,
      tasaMexicoBrasil: 4,
      tasaMexicoPanama: null,
      tasaMexicoColombia: 0,
      tasaMexicoEspaña: 9,
      tasaMexicoEcuador: 7,
      tasaMexicoUSA: null,
      speed: null,
      tasasP: null,
    },
    5: {
      tasaVenezuelaChile: 2,
      tasaVenezuelaPeru: 5,
      tasaVenezuelaArgentina: 1,
      tasaVenezuelaBrasil: null,
      tasaVenezuelaColombia: 0,
      tasaVenezuelaEspaña: null,
      tasaVenezuelaEcuador: 8,
      tasaVenezuelaMexico: 3,
    }
  };

  let configAUsar;
  if (esCambios) {
    configAUsar = configuraciones[2];
  } else if ((esEnvioChile || esEnvioChileTilde || esEnvioChileTildexdd || esEnvioChilexd) && esUsuarioPlus) {
    configAUsar = configuraciones[3];
  } else if ((esEnvioMexico || esEnvioMexicoConTilde || esEnvioMexicoSinTildexd || esEnvioMexicoSinTildexdd) && esUsuarioPlus) {
    configAUsar = configuraciones[4];
  } else if (esEnvioVenezuela || esEnvioVenezuelaXd) {
    configAUsar = configuraciones[5];
  } else {
    configAUsar = configuraciones[1];
  }

  return aplicarConfiguracion(tasasOrdenadas, configAUsar);
}














