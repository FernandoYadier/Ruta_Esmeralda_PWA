"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Corazón para guardar o quitar un lugar de favoritos.
// Sin sesión, manda a iniciar sesión y regresa a la misma página.
export default function BotonFavorito({ lugarId, inicial = false, haySesion = false, className = "", onCambio }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activo, setActivo] = useState(inicial);
  const [pendiente, setPendiente] = useState(false);

  async function alternar() {
    if (!haySesion) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const nuevo = !activo;
    setActivo(nuevo); // se actualiza al instante y se revierte si falla
    setPendiente(true);

    const supabase = createClient();
    const { error } = nuevo
      ? await supabase.from("favoritos").insert({ lugar_id: lugarId })
      : await supabase.from("favoritos").delete().eq("lugar_id", lugarId);

        if (error) setActivo(!nuevo);
    else onCambio?.(nuevo);
    setPendiente(false);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={pendiente}
      aria-pressed={activo}
      aria-label={activo ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white disabled:opacity-60 ${className}`}
    >
      <Heart
        size={17}
        aria-hidden="true"
        className={activo ? "fill-red-500 text-red-500" : "text-gray-500"}
      />
    </button>
  );
}
