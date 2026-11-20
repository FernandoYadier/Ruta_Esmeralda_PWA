import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rutaSegura } from "@/lib/rutas";

// Destino del enlace del correo de confirmación.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type");
  const siguiente = rutaSegura(searchParams.get("next"));

  if (tokenHash && tipo) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    if (!error) redirect(siguiente);
  }

  redirect("/login?error=confirmacion");
}
