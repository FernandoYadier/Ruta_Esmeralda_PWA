import MisRecorridos from "@/components/recorridos/MisRecorridos";
import PlaneadorRuta from "@/components/recorridos/PlaneadorRuta";
import Button from "@/components/ui/Button";
import { DURACIONES, generarRecorridoParaPersona } from "@/lib/recorridos";
import { getCategorias } from "@/services/categorias";
import { getLugares } from "@/services/lugares";
import { getMisRecorridos } from "@/services/recorridos";
import { getSesion } from "@/services/sesion";

export const metadata = { title: "Planea tu ruta · Ruta Esmeralda" };

// Si la dirección trae ?duracion=...&intereses=1,3 (como el botón del inicio), el recorrido se abre ya armado.
export default async function RecorridosPage({ searchParams }) {
  const params = await searchParams;
  const [lugares, categorias, sesion] = await Promise.all([getLugares({ limite: 300 }), getCategorias(), getSesion()]);

  const duracionPedida = typeof params.duracion === "string" ? params.duracion : "";
  const generarAlEntrar = Object.hasOwn(DURACIONES, duracionPedida);
  const duracion = generarAlEntrar ? duracionPedida : "1-dia";
  const intereses = (typeof params.intereses === "string" ? params.intereses.split(",") : [])
    .map(Number)
    .filter((id) => categorias.some((c) => c.id === id));

  const idsLugares = generarAlEntrar
    ? generarRecorridoParaPersona(lugares, categorias, { duracion, categoriaIds: intereses }).paradas.map((p) => p.lugar.id)
    : [];

  const misRecorridos = sesion ? await getMisRecorridos() : [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight text-esmeralda-900 sm:text-3xl">Planea tu ruta</h1>
        <p className="mt-1 text-sm text-gray-600">
          Cuéntanos cuánto tiempo te quedas y qué te gusta; arma tu recorrido, ajústalo a tu medida y guárdalo.
        </p>
      </div>

      <PlaneadorRuta
        key={`${duracion}|${intereses.join(".")}|${generarAlEntrar}`}
        lugares={lugares}
        categorias={categorias}
        inicial={{ duracion, intereses, idsLugares }}
        haySesion={Boolean(sesion)}
      />

      <section aria-labelledby="titulo-mis-recorridos">
        <h2 id="titulo-mis-recorridos" className="text-lg font-extrabold uppercase tracking-wide text-esmeralda-900">
          Mis recorridos
        </h2>
        <div className="mt-4">
          {sesion ? (
            <MisRecorridos recorridos={misRecorridos} />
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-2xl bg-esmeralda-50 p-5 ring-1 ring-esmeralda-100 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">Inicia sesión para guardar tus recorridos y volver a verlos.</p>
              <Button href={`/login?next=${encodeURIComponent("/recorridos")}`}>Iniciar sesión</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
