import Link from "next/link";
import { estiloCategoria } from "@/lib/categorias-estilo";

// Franja de servicios útiles (hospitales, cajeros, supermercados, transporte...).
// Si todavía no hay lugares de la categoría "Servicios", no se muestra.
export default function ServiciosUtiles({ servicios }) {
  if (servicios.length === 0) return null;
  const { icono: Icono } = estiloCategoria("servicios");

  return (
    <section aria-labelledby="titulo-servicios" className="rounded-3xl bg-esmeralda-50 p-5 ring-1 ring-esmeralda-100">
      <h2 id="titulo-servicios" className="text-sm font-extrabold uppercase tracking-wide text-esmeralda-900">
        Servicios útiles para ti
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {servicios.map((servicio) => (
          <li key={servicio.id}>
            <Link
              href={`/lugar/${servicio.slug}`}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-esmeralda-100 transition hover:shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-esmeralda-100 text-esmeralda-800">
                <Icono size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-esmeralda-900">{servicio.nombre}</span>
                {servicio.direccion && (
                  <span className="block truncate text-xs text-gray-500">{servicio.direccion}</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
