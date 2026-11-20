// Generación de recorridos sugeridos. Es lógica pura (sin React ni Supabase),
// así que se puede probar y reutilizar en cualquier pantalla.

// Cuántas paradas sugerir según el tiempo de estancia y cuántas caben en un día.
export const DURACIONES = {
  "1-dia": { etiqueta: "1 día", paradas: 5, porDia: 5 },
  "fin-de-semana": { etiqueta: "Fin de semana", paradas: 9, porDia: 5 },
  "estancia-larga": { etiqueta: "Estancia larga", paradas: 14, porDia: 5 },
  mudandome: { etiqueta: "Mudándome", paradas: 8, porDia: 4 },
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
