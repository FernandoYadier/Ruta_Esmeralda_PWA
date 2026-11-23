"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase/client";

// Elimina un recorrido guardado (con confirmación). Sus paradas se borran solas en la base.
// irA: dirección a la que se va después de eliminar; si no se indica, solo se recarga la página.
export default function EliminarRecorrido({ recorridoId, titulo, irA, className = "" }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  async function eliminar() {
    setEliminando(true);
    setError("");
    const supabase = createClient();
    const { error: errorBorrado } = await supabase.from("recorridos").delete().eq("id", recorridoId);
    if (errorBorrado) {
      setError("No pudimos eliminar el recorrido. Inténtalo de nuevo.");
      setEliminando(false);
      return;
    }
    setAbierto(false);
    setEliminando(false);
    if (irA) router.push(irA);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label={`Eliminar el recorrido ${titulo}`}
        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 ${className}`}
      >
        <Trash2 size={14} aria-hidden="true" />
        Eliminar
      </button>

      <Modal abierto={abierto} onCerrar={() => !eliminando && setAbierto(false)} titulo="¿Eliminar este recorrido?">
        <p className="text-sm text-gray-700">
          Se borrará «{titulo}» con todas sus paradas. No se puede deshacer.
        </p>
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
