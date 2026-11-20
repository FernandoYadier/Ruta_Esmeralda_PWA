"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";
import { BUCKETS, eliminarImagenes, rutaDesdeUrl } from "@/lib/storage";

// Elimina una reseña propia (y sus fotos) después de pedir confirmación.
export default function BotonEliminarResena({ resenaId, fotos = [] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  async function eliminar() {
    setEliminando(true);
    setError("");

    const supabase = createClient();
    const { error: errorBorrado } = await supabase.from("resenas").delete().eq("id", resenaId);
    if (errorBorrado) {
      setError("No pudimos eliminar tu reseña. Inténtalo de nuevo.");
      setEliminando(false);
      return;
    }

    // Las filas de las fotos se borran solas con la reseña; los archivos se limpian aquí.
    const rutas = fotos.map((url) => rutaDesdeUrl(url, BUCKETS.resenas)).filter(Boolean);
    await eliminarImagenes({ bucket: BUCKETS.resenas, rutas }).catch(() => {});

    setAbierto(false);
    setEliminando(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
      >
        <Trash2 size={14} aria-hidden="true" />
        Eliminar
      </button>

      <Modal abierto={abierto} onCerrar={() => !eliminando && setAbierto(false)} titulo="¿Eliminar tu reseña?">
        <p className="text-sm text-gray-700">Se borrará tu calificación, tu comentario y tus fotos. No se puede deshacer.</p>
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variante="fantasma" onClick={() => setAbierto(false)} disabled={eliminando}>
            Cancelar
          </Button>
          <Button onClick={eliminar} disabled={eliminando} className="bg-red-700 hover:bg-red-800">
            {eliminando ? "Eliminando…" : "Sí, eliminar"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
