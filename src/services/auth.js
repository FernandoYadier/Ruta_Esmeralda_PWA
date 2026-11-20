"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rutaSegura } from "@/lib/rutas";

const MENSAJES = {
  invalid_credentials: "Correo o contraseña incorrectos.",
  email_not_confirmed: "Todavía no confirmas tu correo. Revisa tu bandeja de entrada.",
  weak_password: "La contraseña es muy débil. Usa al menos 8 caracteres.",
  over_email_send_rate_limit: "Se enviaron demasiados correos. Espera unos minutos e inténtalo otra vez.",
  over_request_rate_limit: "Demasiados intentos. Espera un momento e inténtalo otra vez.",
  email_address_invalid: "Ese correo no es válido.",
  signup_disabled: "Los registros están desactivados por el momento.",
};

const traducirError = (error) => MENSAJES[error.code] ?? "No pudimos completar la operación. Inténtalo de nuevo.";

// Acciones para useActionState: reciben (estadoPrevio, formData) y devuelven el nuevo estado.
export async function iniciarSesion(_estadoPrevio, formData) {
  const correo = String(formData.get("correo") ?? "").trim();
  const contrasena = String(formData.get("contrasena") ?? "");
  const siguiente = rutaSegura(String(formData.get("siguiente") ?? ""));

  if (!correo || !contrasena) {
    return { error: "Escribe tu correo y tu contraseña.", correo };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) return { error: traducirError(error), correo };

  redirect(siguiente);
}

export async function registrarse(_estadoPrevio, formData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const correo = String(formData.get("correo") ?? "").trim();
  const contrasena = String(formData.get("contrasena") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");
  const valores = { nombre, correo };

  if (!nombre) return { error: "Escribe tu nombre.", ...valores };
  if (!correo) return { error: "Escribe tu correo.", ...valores };
  if (contrasena.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres.", ...valores };
  if (contrasena !== confirmar) return { error: "Las contraseñas no coinciden.", ...valores };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: { data: { nombre } }, // el trigger de la base lo copia al perfil
  });
  if (error) return { error: traducirError(error), ...valores };

  // Con la confirmación de correo desactivada, la sesión se crea al instante.
  if (data.session) redirect("/");

  return { exito: "Te enviamos un correo para confirmar tu cuenta. Ábrelo y entra desde el enlace." };
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
