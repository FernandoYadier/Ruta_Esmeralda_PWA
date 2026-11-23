// Generación de recorridos sugeridos. Es lógica pura (sin React ni Supabase),
// así que se puede probar y reutilizar en cualquier pantalla.

// Cuántas paradas sugerir según el tiempo de estancia y cuántas caben en un día.
export const DURACIONES = {
  "1-dia": { etiqueta: "1 día", titulo: "Mi recorrido de 1 día", paradas: 5, porDia: 5 },
  "fin-de-semana": { etiqueta: "Fin de semana", titulo: "Mi recorrido de fin de semana", paradas: 9, porDia: 5 },
  "estancia-larga": { etiqueta: "Estancia larga", titulo: "Mi recorrido de estancia larga", paradas: 14, porDia: 5 },
  mudandome: { etiqueta: "Mudándome", titulo: "Mi guía para mudarme", paradas: 8, porDia: 4 },
};

const RADIO_TIERRA_KM = 6371;

// Distancia en línea recta entre dos puntos (km).
export function distanciaKm(a, b) {
  const aRad = (grados) => (grados * Math.PI) / 180;
  const dLat = aRad(b.latitud - a.latitud);
  const dLon = aRad(b.longitud - a.longitud);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(a.latitud)) * Math.cos(aRad(b.latitud)) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h));
}

const tieneUbicacion = (lugar) => Number.isFinite(lugar.latitud) && Number.isFinite(lugar.longitud);

// Mejor calificados primero; a igualdad, los que tienen más reseñas; luego por nombre.
const porCalificacion = (a, b) =>
  (b.calificacion_promedio ?? 0) - (a.calificacion_promedio ?? 0) ||
  (b.total_resenas ?? 0) - (a.total_resenas ?? 0) ||
  a.nombre.localeCompare(b.nombre, "es");

// Ordena los lugares como un camino: empieza en el primero y siempre va al más cercano.
function ordenarPorCercania(lugares) {
  const pendientes = [...lugares];
  const camino = [pendientes.shift()];
  while (pendientes.length > 0) {
    const actual = camino[camino.length - 1];
    let mejor = 0;
    for (let i = 1; i < pendientes.length; i++) {
      if (distanciaKm(actual, pendientes[i]) < distanciaKm(actual, pendientes[mejor])) mejor = i;
    }
    camino.push(pendientes.splice(mejor, 1)[0]);
  }
  return camino;
}

// lugares: los publicados (con latitud, longitud, categoria_id, calificacion_promedio...).
// opciones:
//   duracion      → llave de DURACIONES
//   categoriaIds  → intereses elegidos (vacío = todas las categorías)
//   prioritarias  → ids de categorías que deben entrar primero (p. ej. servicios si la persona se muda)
//   excluirPorDefecto → ids de categorías que NO son paradas turísticas (servicios, hospedaje):
//                       solo entran si la persona las elige como interés o están en "prioritarias"
export function generarRecorrido(
  lugares,
  { duracion = "1-dia", categoriaIds = [], prioritarias = [], excluirPorDefecto = [] } = {},
) {
  const config = DURACIONES[duracion] ?? DURACIONES["1-dia"];
  const disponibles = lugares.filter(tieneUbicacion);
  const candidatos =
    categoriaIds.length > 0
      ? disponibles.filter((l) => categoriaIds.includes(l.categoria_id))
      : disponibles.filter((l) => !excluirPorDefecto.includes(l.categoria_id));

  const elegidos = [];

  // 1) Las categorías prioritarias entran primero (hasta 3 lugares).
  if (prioritarias.length > 0) {
    const importantes = disponibles.filter((l) => prioritarias.includes(l.categoria_id)).sort(porCalificacion);
    elegidos.push(...importantes.slice(0, Math.min(3, config.paradas)));
  }

  // 2) El resto se reparte por turnos entre categorías (variedad), de mejor a peor calificado.
  const yaElegido = new Set(elegidos.map((l) => l.id));
  const porCategoria = new Map();
  for (const lugar of [...candidatos].sort(porCalificacion)) {
    if (yaElegido.has(lugar.id)) continue;
    if (!porCategoria.has(lugar.categoria_id)) porCategoria.set(lugar.categoria_id, []);
    porCategoria.get(lugar.categoria_id).push(lugar);
  }
  while (elegidos.length < config.paradas && [...porCategoria.values()].some((lista) => lista.length > 0)) {
    for (const lista of porCategoria.values()) {
      if (lista.length > 0 && elegidos.length < config.paradas) elegidos.push(lista.shift());
    }
  }

  if (elegidos.length === 0) return { paradas: [], dias: 0, distanciaKm: 0 };

  // 3) Se ordenan como camino, partiendo del mejor calificado, y se reparten por días.
  const [primero, ...resto] = [...elegidos].sort(porCalificacion);
  const camino = ordenarPorCercania([primero, ...resto]);

  let total = 0;
  for (let i = 1; i < camino.length; i++) total += distanciaKm(camino[i - 1], camino[i]);

  const paradas = camino.map((lugar, indice) => ({
    lugar,
    orden: indice + 1,
    dia: Math.floor(indice / config.porDia) + 1,
  }));

  return {
    paradas,
    dias: paradas[paradas.length - 1].dia,
    distanciaKm: Math.round(total * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// Planeador: armado de días, tiempos y edición de un recorrido.
// Un "item" del recorrido es { lugar, minutos, dia? }: "minutos" es lo que se piensa
// pasar en el lugar; "dia" solo viene de los recorridos ya guardados.
// ---------------------------------------------------------------------------

// Minutos de visita sugeridos según la categoría (llave = slug de la tabla categorias).
export const MINUTOS_VISITA = {
  "cultura-e-historia": 90,
  "naturaleza-y-parques": 90,
  gastronomia: 60,
  "recreacion-y-diversion": 90,
  compras: 60,
  hospedaje: 30,
  servicios: 30,
};

export const minutosVisita = (slug) => MINUTOS_VISITA[slug] ?? 60;

const VELOCIDAD_CIUDAD_KMH = 25; // promedio aproximado en la ciudad
const FACTOR_CALLES = 1.3; // las calles dan más vuelta que la línea recta

// Traslado aproximado entre dos lugares: distancia en línea recta y minutos estimados.
export function traslado(a, b) {
  const km = distanciaKm(a, b);
  return { km: Math.round(km * 10) / 10, min: Math.max(1, Math.round(((km * FACTOR_CALLES) / VELOCIDAD_CIUDAD_KMH) * 60)) };
}

// 95 → "1 h 35 min" · 120 → "2 h" · 45 → "45 min"
export function formatoDuracion(minutos) {
  const total = Math.round(minutos);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// Reparte los items en días y calcula tiempos y traslados.
//   - Si los items traen "dia" (recorrido guardado) se respeta.
//   - Si no, se reparten de "porDia" en "porDia".
// Devuelve { dias: [{ dia, paradas: [{ ...item, indice, trasladoDesdeAnterior }], minutos, km }], totalMin, totalKm, totalParadas }
export function armarDias(items, { porDia = 5 } = {}) {
  const porNumero = new Map();
  items.forEach((item, indice) => {
    const dia = item.dia ?? Math.floor(indice / porDia) + 1;
    if (!porNumero.has(dia)) porNumero.set(dia, []);
    porNumero.get(dia).push({ ...item, dia, indice });
  });

  const dias = [...porNumero.entries()]
    .sort(([a], [b]) => a - b)
    .map(([dia, paradas]) => {
      let minutos = 0;
      let km = 0;
      const conTraslado = paradas.map((parada, i) => {
        const t = i > 0 ? traslado(paradas[i - 1].lugar, parada.lugar) : null;
        minutos += parada.minutos + (t?.min ?? 0);
        km += t?.km ?? 0;
        return { ...parada, trasladoDesdeAnterior: t };
      });
      return { dia, paradas: conTraslado, minutos, km: Math.round(km * 10) / 10 };
    });

  return {
    dias,
    totalMin: dias.reduce((suma, d) => suma + d.minutos, 0),
    totalKm: Math.round(dias.reduce((suma, d) => suma + d.km, 0) * 10) / 10,
    totalParadas: items.length,
  };
}

// Mueve el item de la posición "indice" hacia arriba (-1) o abajo (+1). No hace nada si se sale de la lista.
export function moverItem(items, indice, delta) {
  const destino = indice + delta;
  if (indice < 0 || indice >= items.length || destino < 0 || destino >= items.length) return items;
  const copia = [...items];
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}

export const quitarItem = (items, indice) => items.filter((_, i) => i !== indice);

// Genera un recorrido aplicando las reglas del producto: servicios y hospedaje no son paradas
// turísticas (solo entran si la persona los elige) y quien se muda recibe primero los servicios.
export function generarRecorridoParaPersona(lugares, categorias, { duracion = "1-dia", categoriaIds = [] } = {}) {
  const idServicios = categorias.find((c) => c.slug === "servicios")?.id;
  const noTuristicas = categorias.filter((c) => ["servicios", "hospedaje"].includes(c.slug)).map((c) => c.id);
  return generarRecorrido(lugares, {
    duracion,
    categoriaIds,
    excluirPorDefecto: noTuristicas,
    prioritarias: duracion === "mudandome" && idServicios ? [idServicios] : [],
  });
}

// Convierte las paradas de generarRecorrido en items con sus minutos de visita.
export function itemsDesdeLugares(lugares, categorias) {
  const slugPorId = Object.fromEntries(categorias.map((c) => [c.id, c.slug]));
  return lugares.map((lugar) => ({ lugar, minutos: minutosVisita(slugPorId[lugar.categoria_id]) }));
}

// Dirección del planeador con un recorrido ya pensado (la usa el inicio: "Personalizar y guardar").
export function urlPlaneador({ duracion, categoriaIds = [] } = {}) {
  const params = new URLSearchParams();
  if (duracion) params.set("duracion", duracion);
  if (categoriaIds.length > 0) params.set("intereses", categoriaIds.join(","));
  const texto = params.toString();
  return texto ? `/recorridos?${texto}` : "/recorridos";
}
