"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { BUCKETS, subirImagen, validarImagen } from "@/lib/storage";

const MAX_FOTOS = 3;
const NOMBRES_ESTRELLAS = ["Muy malo", "Malo", "Regular", "Bueno", "Excelente"];

// Formulario para escribir una reseña: estrellas, comentario y hasta 3 fotos.
export default function FormularioResena({ lugarId, usuarioId }) {
  const router = useRouter();
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [estado, setEstado] = useState({ enviando: false, error: "" });

  function elegirFotos(evento) {
    const elegidas = Array.from(evento.target.files ?? []);
    if (elegidas.length > MAX_FOTOS) {
      setEstado({ enviando: false, error: `Puedes agregar hasta ${MAX_FOTOS} fotos.` });
      evento.target.value = "";
      setArchivos([]);
      return;
    }
    const problema = elegidas.map((a) => validarImagen(a, BUCKETS.resenas)).find(Boolean);
    if (problema) {
      setEstado({ enviando: false, error: problema });
      evento.target.value = "";
      setArchivos([]);
      return;
    }
    setEstado({ enviando: false, error: "" });
    setArchivos(elegidas);
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (calificacion === 0) {
      setEstado({ enviando: false, error: "Elige cuántas estrellas le das al lugar." });
      return;
    }
    setEstado({ enviando: true, error: "" });

    const supabase = createClient();
    const { data: resena, error } = await supabase
      .from("resenas")
      .insert({ lugar_id: lugarId, calificacion, comentario: comentario.trim() || null })
      .select("id")
      .single();

    if (error) {
      const mensaje =
        error.code === "23505"
          ? "Ya escribiste una reseña de este lugar."
          : "No pudimos guardar tu reseña. Inténtalo de nuevo.";
      setEstado({ enviando: false, error: mensaje });
      return;
    }

    // La reseña ya existe; las fotos se suben una por una y se registran.
    try {
      for (const archivo of archivos) {
        const { url } = await subirImagen({ bucket: BUCKETS.resenas, carpeta: usuarioId, archivo });
        const { error: errorFoto } = await supabase.from("resena_fotos").insert({ resena_id: resena.id, url });
        if (errorFoto) throw new Error(errorFoto.message);
      }
    } catch {
      setEstado({ enviando: false, error: "Tu reseña se publicó, pero no pudimos subir todas las fotos." });
      router.refresh();
      return;
    }

    setCalificacion(0);
    setComentario("");
    setArchivos([]);
    setEstado({ enviando: false, error: "" });
    router.refresh(); // vuelve a pedir los datos: la reseña aparece en la lista
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4 rounded-2xl bg-esmeralda-50 p-5 ring-1 ring-esmeralda-100">
      <h3 className="font-semibold text-esmeralda-900">Escribe tu reseña</h3>

      <div>
        <p id="etiqueta-estrellas" className="mb-1.5 text-sm font-medium text-esmeralda-900">
          Tu calificación
        </p>
        <div role="radiogroup" aria-labelledby="etiqueta-estrellas" className="flex items-center gap-1">
          {NOMBRES_ESTRELLAS.map((nombre, indice) => {
            const valor = indice + 1;
            return (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={calificacion === valor}
                aria-label={`${valor} ${valor === 1 ? "estrella" : "estrellas"}: ${nombre}`}
                onClick={() => setCalificacion(valor)}
                className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-esmeralda-700"
              >
                <Star
                  size={30}
                  aria-hidden="true"
                  className={valor <= calificacion ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                />
              </button>
            );
          })}
          {calificacion > 0 && (
            <span className="ml-2 text-sm font-medium text-gray-700">{NOMBRES_ESTRELLAS[calificacion - 1]}</span>
          )}
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-esmeralda-900">
        Tu comentario (opcional)
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Cuéntanos cómo fue tu experiencia…"
          className="rounded-xl border border-esmeralda-200 bg-white px-4 py-2.5 text-sm font-normal text-gray-900 placeholder:text-gray-400"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-esmeralda-900">
        Fotos (opcional, hasta {MAX_FOTOS})
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={elegirFotos}
          className="text-sm font-normal text-gray-700"
        />
      </label>

      {estado.error && (
        <p role="alert" className="text-sm text-red-600">
          {estado.error}
        </p>
      )}

      <div>
        <Button type="submit" disabled={estado.enviando}>
          {estado.enviando ? "Publicando…" : "Publicar reseña"}
        </Button>
      </div>
    </form>
  );
}
