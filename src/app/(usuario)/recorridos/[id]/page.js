import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Mapa from "@/components/mapa/Mapa";
import EliminarRecorrido from "@/components/recorridos/EliminarRecorrido";
import ItinerarioDias from "@/components/recorridos/ItinerarioDias";
import { armarDias, formatoDuracion } from "@/lib/recorridos";
import { getCategorias } from "@/services/categorias";
import { getRecorrido } from "@/services/recorridos";
import { getSesion } from "@/services/sesion";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const recorrido = (await getSesion()) ? await getRecorrido(id) : null;
  return { title: recorrido ? `${recorrido.titulo} · Ruta Esmeralda` : "Recorrido no encontrado · Ruta Esmeralda" };
}

// Un recorrido guardado. La base solo deja verlo a su dueño: para cualquier otra persona es un 404.
export default async function RecorridoPage({ params }) {
  const { id } = await params;

  // El proxy ya exige sesión aquí; esta comprobación evita un error si algún día cambia esa regla.
  if (!(await getSesion())) redirect(`/login?next=${encodeURIComponent(`/recorridos/${id}`)}`);

  const [recorrido, categorias] = await Promise.all([getRecorrido(id), getCategorias()]);
  if (!recorrido) notFound();

  const categoriaPorId = Object.fromEntries(categorias.map((c) => [c.id, c]));
  const plan = armarDias(recorrido.items);
  const lugares = recorrido.items.map((i) => i.lugar);

  return (
    <article className="mx-auto max-w-7xl px-4 py-6">
      <Link
        href="/recorridos"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-esmeralda-700 hover:underline"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a Planea tu ruta
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-esmeralda-900 sm:text-3xl">{recorrido.titulo}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {plan.totalParadas} {plan.totalParadas === 1 ? "parada" : "paradas"} · {plan.dias.length}{" "}
            {plan.dias.length === 1 ? "día" : "días"}
            {plan.totalParadas > 0 && ` · ≈ ${formatoDuracion(plan.totalMin)} entre visitas y traslados`}
          </p>
          {recorrido.paradasOmitidas > 0 && (
            <p className="mt-1 text-xs text-amber-700">
              {recorrido.paradasOmitidas}{" "}
              {recorrido.paradasOmitidas === 1 ? "lugar de este recorrido ya no está disponible" : "lugares de este recorrido ya no están disponibles"}.
            </p>
          )}
        </div>
        <EliminarRecorrido recorridoId={recorrido.id} titulo={recorrido.titulo} irA="/recorridos" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="min-w-0">
          {plan.totalParadas > 0 ? (
            <ItinerarioDias plan={plan} categoriaPorId={categoriaPorId} />
          ) : (
            <p className="rounded-2xl bg-esmeralda-50 p-5 text-sm text-gray-700 ring-1 ring-esmeralda-100">
              Este recorrido no tiene lugares disponibles.
            </p>
          )}
        </div>
        <div className="h-[380px] lg:sticky lg:top-20 lg:h-[calc(100dvh-8rem)] lg:min-h-[480px] lg:max-h-[640px] lg:self-start">
          <Mapa
            lugares={lugares}
            categorias={categorias}
            ruta={lugares}
            className="h-full rounded-3xl ring-1 ring-esmeralda-200"
          />
        </div>
      </div>
    </article>
  );
}
