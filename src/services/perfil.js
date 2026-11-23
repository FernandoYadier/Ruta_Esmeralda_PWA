"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSesion } from "@/services/sesion";

const TIPOS_ESTANCIA = ["turista", "nuevo_habitante"];
const MAX_NOMBRE = 60;

// Acción para useActionState: recibe (estadoPrevio, formData) y devuelve el nuevo estado.
// Devuelve siempre los valores escritos para que el formulario no los pierda si hay un error.
export async function actualizarPerfil(_estadoPrevio, formData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const tipoTexto = String(formData.get("tipo_estancia") ?? "");
  const valores = { nombre, tipoEstancia: tipoTexto };

  if (!nombre) return { error: "Escribe tu nombre.", ...valores };
  if (nombre.length > MAX_NOMBRE) {
    return { error: `El nombre no puede tener más de ${MAX_NOMBRE} caracteres.`, ...valores };
  }

  // "" significa "sin definir" y se guarda como null.
  const tipo_estancia = tipoTexto === "" ? null : tipoTexto;
  if (tipo_estancia !== null && !TIPOS_ESTANCIA.includes(tipo_estancia)) {
    return { error: "Elige una opción válida para tu tipo de estancia.", ...valores };
  }

  const sesion = await getSesion();
  if (!sesion) return { error: "Tu sesión expiró. Vuelve a iniciar sesión.", ...valores };

  // Solo se envían las columnas que la base permite editar (rol no se toca).
  const supabase = await createClient();
  const { error } = await supabase
    .from("perfiles")
    .update({ nombre, tipo_estancia })
    .eq("id", sesion.id);
  if (error) return { error: "No pudimos guardar tus cambios. Inténtalo de nuevo.", ...valores };

  // Así el Header (que está en el layout) muestra el nombre nuevo sin cerrar sesión.
  revalidatePath("/", "layout");
  return { exito: "Tus datos se guardaron correctamente.", ...valores };
}

// Ids de las categorías que la persona conectada marcó como interés ([] si no hay sesión).
// La base ya limita la consulta a los intereses propios (RLS).
export async function getInteresesIds() {
  const sesion = await getSesion();
  if (!sesion) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.from("perfil_intereses").select("categoria_id");
  if (error) throw new Error(`No se pudieron cargar tus intereses: ${error.message}`);
  return data.map((fila) => fila.categoria_id);
}

// Reseñas escritas por la persona conectada, de la más reciente a la más antigua ([] si no hay sesión).
// "lugares" puede venir vacío si el lugar ya no está publicado.
export async function getMisResenas() {
  const sesion = await getSesion();
  if (!sesion) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resenas")
    .select("id, calificacion, comentario, created_at, lugar_id, lugares(nombre, slug), resena_fotos(id, url)")
    .eq("usuario_id", sesion.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar tus reseñas: ${error.message}`);
  return data;
}

const MIN_CONTRASENA = 8;

const MENSAJES_CONTRASENA = {
  same_password: "La contraseña nueva debe ser diferente a la actual.",
  weak_password: "La contraseña es muy débil. Usa al menos 8 caracteres y mezcla letras y números.",
  reauthentication_needed: "Por seguridad, cierra sesión, vuelve a entrar e inténtalo de nuevo.",
  session_expired: "Tu sesión expiró. Vuelve a iniciar sesión.",
  session_not_found: "Tu sesión expiró. Vuelve a iniciar sesión.",
  over_request_rate_limit: "Demasiados intentos. Espera un momento e inténtalo otra vez.",
};

// Acción para useActionState: cambia la contraseña de la persona con sesión iniciada.
export async function cambiarContrasena(_estadoPrevio, formData) {
  const nueva = String(formData.get("contrasena_nueva") ?? "");
  const confirmar = String(formData.get("contrasena_confirmar") ?? "");

  if (nueva.length < MIN_CONTRASENA) {
    return { error: `La contraseña debe tener al menos ${MIN_CONTRASENA} caracteres.` };
  }
  if (nueva !== confirmar) return { error: "Las contraseñas no coinciden." };

  const sesion = await getSesion();
  if (!sesion) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: nueva });
  if (error) {
    return { error: MENSAJES_CONTRASENA[error.code] ?? "No pudimos cambiar tu contraseña. Inténtalo de nuevo." };
  }

  return { exito: "Tu contraseña se cambió correctamente." };
}