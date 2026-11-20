import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Devuelve a la persona con sesión iniciada (o null). "cache" evita repetir
// la consulta si varios componentes la piden durante la misma petición.
export const getSesion = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre, rol, avatar_url, tipo_estancia")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    correo: claims.email ?? "",
    nombre: perfil?.nombre ?? "",
    rol: perfil?.rol ?? "usuario",
    avatarUrl: perfil?.avatar_url ?? null,
    tipoEstancia: perfil?.tipo_estancia ?? null,
  };
});
