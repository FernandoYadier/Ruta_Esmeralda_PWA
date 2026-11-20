import InicioInteractivo from "@/components/inicio/InicioInteractivo";
import ServiciosUtiles from "@/components/inicio/ServiciosUtiles";
import { getCategorias } from "@/services/categorias";
import { getFavoritosIds } from "@/services/favoritos";
import { getLugares } from "@/services/lugares";
import { getSesion } from "@/services/sesion";

export const metadata = { title: "Ruta Esmeralda · Descubre Villahermosa" };

export default async function InicioPage() {
  const [sesion, lugares, categorias, favoritosIds] = await Promise.all([
    getSesion(),
    getLugares({ limite: 300 }),
    getCategorias(),
    getFavoritosIds(),
  ]);

  const primerNombre = sesion?.nombre?.trim().split(/\s+/)[0];
  const idServicios = categorias.find((c) => c.slug === "servicios")?.id;
  const servicios = lugares.filter((l) => l.categoria_id === idServicios).slice(0, 5);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-esmeralda-900 sm:text-3xl">
        ¡Te damos la bienvenida a Villahermosa{primerNombre ? `, ${primerNombre}` : ""}!
      </h1>

      <InicioInteractivo
        lugares={lugares}
        categorias={categorias}
        favoritosIds={favoritosIds}
        haySesion={Boolean(sesion)}
      />

      <ServiciosUtiles servicios={servicios} />
    </div>
  );
}
