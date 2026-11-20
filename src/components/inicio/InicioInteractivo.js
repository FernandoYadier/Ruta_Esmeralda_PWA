"use client";

import Image from "next/image";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Mapa from "@/components/mapa/Mapa";
import TarjetaLugar from "@/components/lugares/TarjetaLugar";
import { estiloCategoria } from "@/lib/categorias-estilo";
import { DURACIONES, generarRecorrido } from "@/lib/recorridos";

const CANTIDAD_DESTACADOS = 4;

// Parte interactiva de la página de inicio: formulario de recomendaciones, tarjetas y mapa.
// El formulario y el mapa comparten el mismo estado, por eso viven en un solo componente.
export default function InicioInteractivo({ lugares, categorias, favoritosIds = [], haySesion = false }) {
  const [duracion, setDuracion] = useState("1-dia");
  const [intereses, setIntereses] = useState([]); // ids de categorías elegidas
  const [recorrido, setRecorrido] = useState(null);

  const categoriaPorId = Object.fromEntries(categorias.map((c) => [c.id, c]));
  const favoritos = new Set(favoritosIds);

  const destacados = [...lugares]
    .sort(
      (a, b) =>
        (b.calificacion_promedio ?? 0) - (a.calificacion_promedio ?? 0) ||
        (b.total_resenas ?? 0) - (a.total_resenas ?? 0) ||
        a.nombre.localeCompare(b.nombre, "es"),
    )
    .slice(0, CANTIDAD_DESTACADOS);

  function alternarInteres(id) {
    setIntereses((actuales) => (actuales.includes(id) ? actuales.filter((i) => i !== id) : [...actuales, id]));
  }

  function generar(evento) {
    evento.preventDefault();
    const idServicios = categorias.find((c) => c.slug === "servicios")?.id;
    // Servicios y hospedaje no son paradas turísticas: solo entran si la persona los elige.
    const noTuristicas = categorias.filter((c) => ["servicios", "hospedaje"].includes(c.slug)).map((c) => c.id);
    setRecorrido(
      generarRecorrido(lugares, {
        duracion,
        categoriaIds: intereses,
        excluirPorDefecto: noTuristicas,
        // Quien se muda necesita primero los servicios básicos de la ciudad.
        prioritarias: duracion === "mudandome" && idServicios ? [idServicios] : [],
      }),
    );
  }

  const paradas = recorrido?.paradas ?? [];
  const rutaEnMapa = paradas.map((p) => p.lugar);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex min-w-0 flex-col gap-6">
        {/* ---- Formulario de recomendaciones ---- */}
        <section
          aria-labelledby="titulo-planificador"
          className="relative overflow-hidden rounded-3xl bg-esmeralda-100/70 p-5 ring-1 ring-esmeralda-200"
        >
          <Image
            src="/logo/hoja.png"
            alt=""
            width={202}
            height={213}
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 -top-3 h-20 w-auto rotate-12 opacity-90"
          />
          <h2 id="titulo-planificador" className="pr-16 text-sm font-extrabold uppercase tracking-wide text-esmeralda-900">
            Diseña tu experiencia perfecta de la ciudad
          </h2>

          <form onSubmit={generar} className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,12rem)_1fr]">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-esmeralda-900">
              ¿Cuánto tiempo te quedas?
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="rounded-xl border border-esmeralda-200 bg-white px-3 py-2 text-sm font-normal text-gray-900"
              >
                {Object.entries(DURACIONES).map(([clave, { etiqueta }]) => (
                  <option key={clave} value={clave}>
                    {etiqueta}
                  </option>
                ))}
              </select>
            </label>

            <fieldset>
              <legend className="mb-1.5 text-xs font-semibold text-esmeralda-900">Mis intereses</legend>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {categorias.map((categoria) => (
                  <label key={categoria.id} className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={intereses.includes(categoria.id)}
                      onChange={() => alternarInteres(categoria.id)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: estiloCategoria(categoria.slug).color }}
                    />
                    {categoria.nombre}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="sm:col-span-2">
              <Button type="submit" className="w-full bg-esmeralda-900 uppercase tracking-wide hover:bg-esmeralda-800 sm:w-auto">
                <Sparkles size={16} aria-hidden="true" />
                Generar recomendaciones
              </Button>
            </div>
          </form>
        </section>

        {/* ---- Tarjetas: destacados o recorrido generado ---- */}
        <section aria-live="polite">
          {recorrido ? (
            paradas.length > 0 ? (
              <>
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-esmeralda-900">
                  Tu recorrido sugerido
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {paradas.length} {paradas.length === 1 ? "parada" : "paradas"}
                  {recorrido.dias > 1 && ` en ${recorrido.dias} días`}
                  {paradas.length > 1 && ` · unos ${recorrido.distanciaKm} km en línea recta`}
                </p>
              </>
            ) : (
              <p className="rounded-2xl bg-white p-4 text-sm text-gray-700 ring-1 ring-esmeralda-100">
                Todavía no tenemos lugares con esos intereses. Prueba con otras categorías.
              </p>
            )
          ) : (
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-esmeralda-900">Lugares destacados</h2>
          )}

          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {recorrido
              ? paradas.map(({ lugar, orden, dia }) => (
                  <li key={lugar.id}>
                    <TarjetaLugar
                      lugar={lugar}
                      categoria={categoriaPorId[lugar.categoria_id]}
                      favorito={favoritos.has(lugar.id)}
                      haySesion={haySesion}
                      numero={orden}
                      dia={recorrido.dias > 1 ? dia : undefined}
                    />
                  </li>
                ))
              : destacados.map((lugar) => (
                  <li key={lugar.id}>
                    <TarjetaLugar
                      lugar={lugar}
                      categoria={categoriaPorId[lugar.categoria_id]}
                      favorito={favoritos.has(lugar.id)}
                      haySesion={haySesion}
                    />
                  </li>
                ))}
          </ul>

          {!recorrido && lugares.length === 0 && (
            <p className="rounded-2xl bg-white p-4 text-sm text-gray-700 ring-1 ring-esmeralda-100">
              Todavía no hay lugares publicados.
            </p>
          )}
        </section>
      </div>

      {/* ---- Mapa ---- */}
      <div className="h-[380px] lg:sticky lg:top-20 lg:h-[calc(100dvh-8rem)] lg:min-h-[480px] lg:max-h-[640px] lg:self-start">
        <Mapa
          lugares={lugares}
          categorias={categorias}
          ruta={rutaEnMapa}
          className="h-full rounded-3xl ring-1 ring-esmeralda-200"
        />
      </div>
    </div>
  );
}
