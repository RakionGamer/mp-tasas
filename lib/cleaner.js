// lib/cleaner.js

export function limpiarTextoTasasAvanzado(texto) {
  if (!texto) return '';

  let textoNormalizado = texto
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const patrones = [
    /TASA\s*DEL\s*DIA/gi,
    /BBVA\s*Banesco\s*Mercantile\s*Bank\s*BNC\s*Banco\s*de\s*Venezuela/gi,
    /R\s*PLUS\s*REMESAS/gi,
    /\(\s*oPlusremesas/gi,
    /\b(?:am|AM|pm|PM)\b/g
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

  const fechaHoraRegex = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+Hora\s+(\d{1,2}):(\d{2})(?:\s*(am|pm|AM|PM))?)?/i;
  const fechaMatch = textoLimpio.match(fechaHoraRegex);
  let textoSinFecha = textoLimpio.replace(fechaHoraRegex, ' ').replace(/\s+/g, ' ').trim();
  const numberRegex = /[0-9]+(?:[.,][0-9]+)*/g;
  const tasas = textoSinFecha.match(numberRegex) || [];

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
  const esUsuarioPlus = /@Plusremesas/.test(textoSinFecha);

  console.log('Tasas: ', tasas)




  const configuraciones = {
    1: {
      tasaChile: 0,
      tasaPeru: 1,
      tasaColombia: 2,
      tasaBrasil: 6,
      tasaArgentina: null,
      tasaPanama: 7,
      tasaUSA: 4,
      tasaMexico: 5,
      tasaEspaña: 3
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
      tasaChilePeru: 0,
      tasaChileArgentina: 3,
      tasaChileMexico: 8,
      tasaChileBrasil: 1,
      tasaChilePanama: 6,
      tasaChileColombia: 2,
      tasaChileEspaña: 9,
      tasaChileEcuador: 5,
      tasaChileUSA: 7,
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
      tasaMexicoPeru: 0,
      tasaMexicoArgentina: 6,
      tasaMexicoChile: 5,
      tasaMexicoBrasil: 1,
      tasaMexicoPanama: 3,
      tasaMexicoColombia: 4,
      tasaMexicoEspaña: 9,
      tasaMexicoEcuador: 2,
      tasaMexicoUSA: null,
      speed: null,
      tasasP: null,
    },
    5: {
      tasaVenezuelaChile: 0,
      tasaVenezuelaPeru: 1,
      tasaVenezuelaArgentina: 2,
      tasaVenezuelaBrasil: 8,
      tasaVenezuelaColombia: 7,
      tasaVenezuelaEspaña: 9,
      tasaVenezuelaEcuador: 4,
      tasaVenezuelaMexico: 5,
    }
  };

  let configAUsar;
  if (esCambios) {
    configAUsar = configuraciones[2];
  } else if ((esEnvioChile || esEnvioChileTilde || esEnvioChileTildexdd || esEnvioChilexd) && esUsuarioPlus) {
    configAUsar = configuraciones[3];
  } else if ((esEnvioMexico || esEnvioMexicoConTilde || esEnvioMexicoSinTildexd || esEnvioMexicoSinTildexdd) && esUsuarioPlus) {
    configAUsar = configuraciones[4];
  } else if (esEnvioVenezuela) {
    configAUsar = configuraciones[5];
  } else {
    configAUsar = configuraciones[1];
  }

  return aplicarConfiguracion(tasas, configAUsar);
}





