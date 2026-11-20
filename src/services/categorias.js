import { createClient } from "@/lib/supabase/server";

// Todas las categorías, ordenadas por nombre.
export async function getCategorias() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nombre, slug")
    .order("id");

  if (error) throw new Error(`No se pudieron cargar las categorías: ${error.message}`);
  return data;
}
