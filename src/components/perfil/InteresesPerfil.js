"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { estiloCategoria } from "@/lib/categorias-estilo";

// Botones de categorías que la persona activa o desactiva.
// El cambio se ve al instante en pantalla y se revierte si la base de datos falla.
export default function InteresesPerfil({ usuarioId, categorias, interesesIniciales }) {
  const [activos, setActivos] = useState(interesesIniciales);
  const [pendientes, setPendientes] = useState([]);
  const [error, setError] = useState("");

  async function alternar(categoriaId) {
    if (pendientes.includes(categoriaId)) return;

    const estabaActivo = activos.includes(categoriaId);
    setError("");
    // Actualización inmediata en pantalla.
    setActivos((previos) =>
      estabaActivo ? previos.filter((id) => id !== categoriaId) : [...previos, categoriaId],
    );
    setPendientes((previos) => [...previos, categoriaId]);

    const supabase = createClient();
    // En esta tabla hay que enviar usuario_id explícitamente.
    const { error: errorGuardado } = estabaActivo
      ? await supabase
          .from("perfil_intereses")
          .delete()
          .eq("usuario_id", usuarioId)
          .eq("categoria_id", categoriaId)
      : await supabase.from("perfil_intereses").insert({ usuario_id: usuarioId, categoria_id: categoriaId });

    // 23505 = ese interés ya estaba guardado: el resultado es el que la persona quería.
    if (errorGuardado && errorGuardado.code !== "23505") {
      // Se revierte el cambio hecho en pantalla.
      setActivos((previos) =>
        estabaActivo ? [...previos, categoriaId] : previos.filter((id) => id !== categoriaId),
      );
      setError("No pudimos guardar tu interés. Inténtalo de nuevo.");
    }
    setPendientes((previos) => previos.filter((id) => id !== categoriaId));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-esmeralda-900">Mis intereses</h2>
        <p className="mt-1 text-sm text-gray-600">
          Elige lo que más te gusta para recibir recomendaciones y recorridos a tu medida.
        </p>
      </div>

      <ul className="flex flex-wrap gap-2">
        {categorias.map((categoria) => {
          const estilo = estiloCategoria(categoria.slug);
          const activo = activos.includes(categoria.id);
          return (
            <li key={categoria.id}>
              <button
                type="button"
                onClick={() => alternar(categoria.id)}
                aria-pressed={activo}
                disabled={pendientes.includes(categoria.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-esmeralda-700 disabled:opacity-60 ${
                  activo ? "text-white" : "bg-white text-gray-700 ring-1 ring-esmeralda-200 hover:bg-esmeralda-50"
                }`}
                style={activo ? { backgroundColor: estilo.color } : undefined}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: activo ? "#fff" : estilo.color }}
                />
                {estilo.etiqueta}
                {activo && <Check size={14} aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}