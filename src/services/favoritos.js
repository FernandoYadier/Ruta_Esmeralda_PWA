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
