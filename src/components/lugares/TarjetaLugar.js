import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import BotonFavorito from "@/components/lugares/BotonFavorito";
import { estiloCategoria } from "@/lib/categorias-estilo";

// Tarjeta de un lugar (portada, categoría, calificación y corazón de favoritos).
// numero / dia: se muestran solo cuando la tarjeta es una parada de un recorrido.
export default function TarjetaLugar({ lugar, categoria, favorito = false, haySesion = false, numero, dia, onCambioFavorito }) {
  const estilo = estiloCategoria(categoria?.slug);
  const Icono = estilo.icono;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-esmeralda-100 transition hover:shadow-md">
      <div className="relative aspect-[4/3] bg-esmeralda-50">
        {lugar.portada_url ? (
          <Image
            src={lugar.portada_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 18vw, (min-width: 640px) 25vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: `${estilo.color}22`, color: estilo.color }}
          >
            <Icono size={36} aria-hidden="true" />
          </div>
        )}

        {numero && (
          <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-esmeralda-900 text-xs font-bold text-white shadow">
            {numero}
          </span>
        )}
        <BotonFavorito
          onCambio={onCambioFavorito}
          lugarId={lugar.id}
          inicial={favorito}
          haySesion={haySesion}
          className="absolute right-2 top-2 z-10"
        />
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-esmeralda-900">
          {/* El enlace cubre toda la tarjeta; el corazón queda encima (z-10) */}
          <Link href={`/lugar/${lugar.slug}`} className="after:absolute after:inset-0">
            {lugar.nombre}
          </Link>
        </h3>

        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs">
          <span
            className="truncate rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
            style={{ backgroundColor: `${estilo.color}1f`, color: estilo.color }}
          >
            {estilo.etiqueta}
          </span>
          {lugar.total_resenas > 0 ? (
            <span className="flex shrink-0 items-center gap-0.5 font-semibold text-gray-700">
              <Star size={13} aria-hidden="true" className="fill-amber-400 text-amber-400" />
              {lugar.calificacion_promedio}
            </span>
          ) : (
            <span className="shrink-0 text-gray-400">Nuevo</span>
          )}
        </div>

        {dia && <p className="mt-1.5 text-xs font-medium text-esmeralda-700">Día {dia}</p>}
        {lugar.descripcion && <p className="mt-1.5 line-clamp-2 text-xs text-gray-600">{lugar.descripcion}</p>}
      </div>
    </article>
  );
}
