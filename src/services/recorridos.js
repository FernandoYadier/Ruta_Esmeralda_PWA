import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

const COLUMNAS_LUGAR =
  "id, nombre, slug, descripcion, categoria_id, categoria, direccion, latitud, longitud, portada_url, calificacion_promedio, total_resenas";

const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Recorridos guardados de la persona con sesión, del más reciente al más antiguo.
// Cada uno trae cuántas paradas y cuántos días tiene. (La seguridad de la base solo deja ver los propios.)
export async function getMisRecorridos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recorridos")
    .select("id, titulo, duracion_min, created_at, recorrido_paradas(dia)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar tus recorridos: ${error.message}`);

  return data.map((r) => ({
    id: r.id,
    titulo: r.titulo,
    duracionMin: r.duracion_min,
    creadoEn: r.created_at,
    paradas: r.recorrido_paradas.length,
    dias: r.recorrido_paradas.length > 0 ? Math.max(...r.recorrido_paradas.map((p) => p.dia)) : 0,
  }));
}

// Un recorrido guardado con sus paradas en orden. Devuelve null si no existe o no es de esta persona.
// Las paradas cuyo lugar ya no está publicado se omiten.
export const getRecorrido = cache(async (id) => {
  if (!ES_UUID.test(id)) return null;

  const supabase = await createClient();
  const { data: recorrido, error } = await supabase
    .from("recorridos")
    .select("id, titulo, descripcion, duracion_min, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`No se pudo cargar el recorrido: ${error.message}`);
  if (!recorrido) return null;

  const { data: paradas, error: errorParadas } = await supabase
    .from("recorrido_paradas")
    .select("orden, dia, duracion_min, nota, lugar_id")
    .eq("recorrido_id", id)
    .order("orden");
  if (errorParadas) throw new Error(`No se pudieron cargar las paradas: ${errorParadas.message}`);

  let lugares = [];
  if (paradas.length > 0) {
    const { data, error: errorLugares } = await supabase
      .from("lugares_resumen")
      .select(COLUMNAS_LUGAR)
      .in("id", paradas.map((p) => p.lugar_id));
    if (errorLugares) throw new Error(`No se pudieron cargar los lugares: ${errorLugares.message}`);
    lugares = data;
  }
  const lugarPorId = new Map(lugares.map((l) => [l.id, l]));

  return {
    ...recorrido,
    items: paradas
      .filter((p) => lugarPorId.has(p.lugar_id))
      .map((p) => ({ lugar: lugarPorId.get(p.lugar_id), minutos: p.duracion_min ?? 60, dia: p.dia, nota: p.nota })),
    paradasOmitidas: paradas.filter((p) => !lugarPorId.has(p.lugar_id)).length,
  };
});
