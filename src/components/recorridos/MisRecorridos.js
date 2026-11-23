import Link from "next/link";
import Card from "@/components/ui/Card";
import EliminarRecorrido from "@/components/recorridos/EliminarRecorrido";
import { formatoDuracion } from "@/lib/recorridos";

const fecha = (iso) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Mexico_City" });

// Lista de los recorridos guardados de la persona.
export default function MisRecorridos({ recorridos }) {
  if (recorridos.length === 0) {
    return (
      <p className="rounded-2xl bg-esmeralda-50 p-5 text-sm text-gray-700 ring-1 ring-esmeralda-100">
        Todavía no has guardado recorridos. Arma uno arriba y pulsa «Guardar recorrido».
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {recorridos.map((r) => (
        <li key={r.id}>
          <Card className="relative flex h-full flex-col gap-2 !p-4 transition hover:shadow-md">
            <h3 className="font-semibold text-esmeralda-900">
              {/* El enlace cubre toda la tarjeta; el botón de eliminar queda encima (z-10) */}
              <Link href={`/recorridos/${r.id}`} className="after:absolute after:inset-0">
                {r.titulo}
              </Link>
            </h3>
            <p className="text-sm text-gray-600">
              {r.paradas} {r.paradas === 1 ? "parada" : "paradas"} · {r.dias} {r.dias === 1 ? "día" : "días"}
              {r.duracionMin ? ` · visitas ≈ ${formatoDuracion(r.duracionMin)}` : ""}
            </p>
            <div className="mt-auto flex items-center justify-between pt-1">
              <time dateTime={r.creadoEn} className="text-xs text-gray-500">
                {fecha(r.creadoEn)}
              </time>
              <EliminarRecorrido recorridoId={r.id} titulo={r.titulo} className="relative z-10" />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
