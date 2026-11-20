import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Lista de lugares publicados (con categoría y calificación promedio).
// Filtros opcionales: categoriaId (número) y busqueda (texto en el nombre).
export async function getLugares({ categoriaId, busqueda, limite = 100 } = {}) {
  const supabase = await createClient();

  let consulta = supabase
    .from("lugares_resumen")
    .select(
      "id, nombre, slug, descripcion, categoria_id, categoria, direccion, latitud, longitud, portada_url, calificacion_promedio, total_resenas",
    )
    .eq("estado", "publicado")
    .order("nombre")
    .limit(limite);

  if (categoriaId) consulta = consulta.eq("categoria_id", categoriaId);
  if (busqueda?.trim()) consulta = consulta.ilike("nombre", `%${busqueda.trim()}%`);

  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudieron cargar los lugares: ${error.message}`);
  return data;
}

// Un lugar con todo su detalle: fotos, horarios, promociones y reseñas (con el nombre de quien reseñó).
// Devuelve null si no existe o no es visible para quien consulta.
export const getLugarPorSlug = cache(async (slug) => {
  const supabase = await createClient();

  const { data: lugar, error } = await supabase
    .from("lugares_resumen")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`No se pudo cargar el lugar: ${error.message}`);
  if (!lugar) return null;

  const [fotos, horarios, promociones, resenas] = await Promise.all([
    supabase.from("lugar_fotos").select("id, url, orden").eq("lugar_id", lugar.id).order("orden"),
    supabase
      .from("horarios")
      .select("id, dia_semana, abre, cierra, cerrado")
      .eq("lugar_id", lugar.id)
      .order("dia_semana")
      .order("abre"),
    supabase
      .from("promociones")
      .select("id, titulo, descripcion, inicia, termina")
      .eq("lugar_id", lugar.id)
      .eq("activa", true),
    supabase
      .from("resenas")
      .select("id, usuario_id, calificacion, comentario, created_at, resena_fotos(id, url)")
      .eq("lugar_id", lugar.id)
      .order("created_at", { ascending: false }),
  ]);

  for (const { error: e } of [fotos, horarios, promociones, resenas]) {
    if (e) throw new Error(`No se pudo cargar el detalle del lugar: ${e.message}`);
  }

  // Los nombres vienen de la vista pública de perfiles.
  const ids = [...new Set(resenas.data.map((r) => r.usuario_id))];
  let autores = {};
  if (ids.length > 0) {
    const { data: perfiles, error: errorPerfiles } = await supabase
      .from("perfiles_publicos")
      .select("id, nombre, avatar_url")
      .in("id", ids);
    if (errorPerfiles) throw new Error(`No se pudieron cargar los autores: ${errorPerfiles.message}`);
    autores = Object.fromEntries(perfiles.map((p) => [p.id, p]));
  }

  return {
    ...lugar,
    fotos: fotos.data,
    horarios: horarios.data,
    promociones: promociones.data,
    resenas: resenas.data.map((r) => ({ ...r, autor: autores[r.usuario_id] ?? null })),
  };
});

const COLUMNAS_LISTA =
  "id, nombre, slug, descripcion, categoria_id, categoria, direccion, latitud, longitud, portada_url, calificacion_promedio, total_resenas";

// "%" y "_" son comodines en la búsqueda; si la persona los escribe se tratan como texto normal.
const escaparComodines = (texto) => texto.replace(/[\\%_]/g, "\\$&");

// Filtros comunes de la búsqueda: solo publicados, por categoría y por nombre.
function aplicarFiltros(consulta, { categoriaId, busqueda }) {
  consulta = consulta.eq("estado", "publicado");
  if (categoriaId) consulta = consulta.eq("categoria_id", categoriaId);
  if (busqueda?.trim()) consulta = consulta.ilike("nombre", `%${escaparComodines(busqueda.trim())}%`);
  return consulta;
}

// Búsqueda con filtros y paginación para la pantalla Explorar. Devuelve { lugares, total }.
//   orden: "recomendados" (mejor calificados primero) | "nombre" (A–Z)
export async function buscarLugares({ categoriaId, busqueda, orden = "recomendados", pagina = 1, porPagina = 12 } = {}) {
  const supabase = await createClient();
  const desde = (pagina - 1) * porPagina;
  const filtros = { categoriaId, busqueda };

  let consulta = aplicarFiltros(supabase.from("lugares_resumen").select(COLUMNAS_LISTA, { count: "exact" }), filtros);
  consulta =
    orden === "nombre"
      ? consulta.order("nombre")
      : consulta
          .order("calificacion_promedio", { ascending: false })
          .order("total_resenas", { ascending: false })
          .order("nombre");

  const { data, error, count } = await consulta.range(desde, desde + porPagina - 1);

  // Una página más allá del final (p. ej. ?pagina=99) no es un fallo: simplemente no hay lugares.
  if (error?.code === "PGRST103") {
    const { count: total, error: errorConteo } = await aplicarFiltros(
      supabase.from("lugares_resumen").select("id", { count: "exact", head: true }),
      filtros,
    );
    if (errorConteo) throw new Error(`No se pudieron cargar los lugares: ${errorConteo.message}`);
    return { lugares: [], total: total ?? 0 };
  }

  if (error) throw new Error(`No se pudieron cargar los lugares: ${error.message}`);
  return { lugares: data, total: count ?? 0 };
}
