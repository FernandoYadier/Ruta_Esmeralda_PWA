import { createClient } from "@/lib/supabase/server";
import { getSesion } from "@/services/sesion";

// Ids de los lugares que la persona conectada tiene en favoritos ([] si no hay sesión).
export async function getFavoritosIds() {
  const sesion = await getSesion();
  if (!sesion) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.from("favoritos").select("lugar_id");
  if (error) throw new Error(`No se pudieron cargar los favoritos: ${error.message}`);
  return data.map((fila) => fila.lugar_id);
}

export async function getFavoritos() {
  const sesion = await getSesion();
  if (!sesion) return [];

  const supabase = await createClient();
  const { data: guardados, error } = await supabase
    .from("favoritos")
    .select("lugar_id, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los favoritos: ${error.message}`);
  if (guardados.length === 0) return [];

  const { data: lugares, error: errorLugares } = await supabase
    .from("lugares_resumen")
    .select(
      "id, nombre, slug, descripcion, categoria_id, categoria, direccion, latitud, longitud, portada_url, calificacion_promedio, total_resenas",
    )
    .in("id", guardados.map((g) => g.lugar_id));
  if (errorLugares) throw new Error(`No se pudieron cargar los lugares: ${errorLugares.message}`);

  const porId = new Map(lugares.map((l) => [l.id, l]));
  // Si un lugar guardado ya no está publicado, simplemente no aparece (no es un error).
  return guardados
    .filter((g) => porId.has(g.lugar_id))
    .map((g) => ({ ...porId.get(g.lugar_id), guardadoEn: g.created_at }));
}