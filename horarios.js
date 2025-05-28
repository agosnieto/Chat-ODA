function extraerHorario(mensaje) {
  const limpio = mensaje
    .toLowerCase()
    .replace(/h|hs|horas|desde|hasta|de|a|las|la/g, '')
    .replace(/[^\d\-: ]/g, ' ') // limpia signos raros

  const partes = limpio.split(/[- a]/).map(p => p.trim()).filter(p => p);

  if (partes.length >= 2) {
    let inicio = partes[0];
    let fin = partes[1];

    // Normaliza formato HH:MM
    if (!inicio.includes(':')) inicio += ':00';
    if (!fin.includes(':')) fin += ':00';

    return { inicio, fin };
  }

  return null; // No se pudo extraer
}

module.exports = { extraerHorario };
