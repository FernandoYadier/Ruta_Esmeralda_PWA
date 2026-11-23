import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { estiloCategoria } from "@/lib/categorias-estilo";
import { formatoDuracion } from "@/lib/recorridos";

// Recorrido día por día: paradas numeradas, tiempo de visita y traslado aproximado entre paradas.
// Con editable=true muestra botones para subir, bajar y quitar (el estado lo maneja quien lo usa).
export default function ItinerarioDias({ plan, categoriaPorId, editable = false, onMover, onQuitar }) {
  return (
    <div className="space-y-6">
      {plan.dias.map((dia) => (
        <section key={dia.dia} aria-labelledby={`dia-${dia.dia}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-esmeralda-100 pb-2">
            <h3 id={`dia-${dia.dia}`} className="font-extrabold uppercase tracking-wide text-esmeralda-900">
              Día {dia.dia}
            </h3>
            <p className="text-xs text-gray-600">
              ≈ {formatoDuracion(dia.minutos)}
              {dia.km > 0 && ` · unos ${dia.km} km`}
            </p>
          </div>

          <ol className="mt-3">
            {dia.paradas.map((parada) => {
              const { lugar } = parada;
              const estilo = estiloCategoria(categoriaPorId[lugar.categoria_id]?.slug);
              const Icono = estilo.icono;
              return (
                <li key={lugar.id}>
                  {parada.trasladoDesdeAnterior && (
                    <p className="ml-4 border-l-2 border-dashed border-esmeralda-200 py-1.5 pl-6 text-xs text-gray-500">
                      ≈ {parada.trasladoDesdeAnterior.min} min · {parada.trasladoDesdeAnterior.km} km
                    </p>
                  )}
                  <div className="flex items-center gap-3 rounded-2xl bg-white p-2.5 ring-1 ring-esmeralda-100">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-esmeralda-900 text-xs font-bold text-white">
                      {parada.indice + 1}
                    </span>

                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                      {lugar.portada_url ? (
                        <Image src={lugar.portada_url} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <span
                          className="flex h-full w-full items-center justify-center"
                          style={{ backgroundColor: `${estilo.color}22`, color: estilo.color }}
                        >
                          <Icono size={20} aria-hidden="true" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/lugar/${lugar.slug}`}
                        className="block truncate text-sm font-semibold text-esmeralda-900 hover:underline"
                      >
                        {lugar.nombre}
                      </Link>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                        <span className="font-semibold" style={{ color: estilo.color }}>
                          {estilo.etiqueta}
                        </span>
                        <span>Visita ≈ {formatoDuracion(parada.minutos)}</span>
                      </p>
                    </div>

                    {editable && (
                      <div className="flex shrink-0 items-center">
                        <button
                          type="button"
                          onClick={() => onMover(parada.indice, -1)}
                          disabled={parada.indice === 0}
                          aria-label={`Subir ${lugar.nombre}`}
                          className="rounded-full p-1.5 text-gray-500 hover:bg-esmeralda-50 disabled:opacity-30"
                        >
                          <ArrowUp size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMover(parada.indice, 1)}
                          disabled={parada.indice === plan.totalParadas - 1}
                          aria-label={`Bajar ${lugar.nombre}`}
                          className="rounded-full p-1.5 text-gray-500 hover:bg-esmeralda-50 disabled:opacity-30"
                        >
                          <ArrowDown size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onQuitar(parada.indice)}
                          aria-label={`Quitar ${lugar.nombre} del recorrido`}
                          className="rounded-full p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
