import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Globe, MapPin, Navigation, Phone, Tag } from "lucide-react";
import BotonFavorito from "@/components/lugares/BotonFavorito";
import Estrellas from "@/components/lugares/Estrellas";
import ResenasLugar from "@/components/lugares/ResenasLugar";
import Mapa from "@/components/mapa/Mapa";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { estiloCategoria } from "@/lib/categorias-estilo";
import { rutaGoogleMaps, telefonoHref, urlSegura } from "@/lib/enlaces";
import {
  agruparPorDia,
  ahoraEnVillahermosa,
  estadoAhora,
  fechaCorta,
  fechaHoyVillahermosa,
  formatoHora,
} from "@/lib/horarios";

function Galeria({ fotos, nombre, estilo }) {
  const Icono = estilo.icono;

  if (fotos.length === 0) {
    return (
      <div
        className="flex aspect-video w-full items-center justify-center rounded-3xl"
        style={{ backgroundColor: `${estilo.color}1f`, color: estilo.color }}
      >
        <Icono size={64} aria-hidden="true" />
      </div>
    );
  }

  const [principal, ...resto] = fotos;
  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-esmeralda-50">
        <Image
          src={principal}
          alt={nombre}
          fill
          priority
          sizes="(min-width: 1024px) 760px, 100vw"
          className="object-cover"
        />
      </div>
      {resto.length > 0 && (
        <ul className="mt-2 grid grid-cols-4 gap-2">
          {resto.slice(0, 4).map((url, indice) => (
            <li key={url} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-esmeralda-50">
              <Image
                src={url}
                alt={`${nombre}, foto ${indice + 2}`}
                fill
                sizes="(min-width: 1024px) 180px, 25vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Presentación del detalle de un lugar (la página se encarga de pedir los datos).
export default function DetalleLugar({ lugar, categoria, categorias, sesion, esFavorito = false }) {
  const estilo = estiloCategoria(categoria?.slug);
  const fotos = lugar.fotos.length > 0 ? lugar.fotos.map((f) => f.url) : lugar.portada_url ? [lugar.portada_url] : [];

  const dias = agruparPorDia(lugar.horarios);
  const estado = estadoAhora(lugar.horarios);
  const hoy = ahoraEnVillahermosa().dia;

  const hoyIso = fechaHoyVillahermosa();
  const promociones = lugar.promociones.filter(
    (p) => (!p.inicia || p.inicia <= hoyIso) && (!p.termina || p.termina >= hoyIso),
  );

  const web = urlSegura(lugar.sitio_web);
  const telefono = telefonoHref(lugar.telefono);

  return (
    <article className="mx-auto max-w-7xl px-4 py-6">
      <Link
        href="/explorar"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-esmeralda-700 hover:underline"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a explorar
      </Link>

      <div className="mt-4 grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="lg:col-start-1">
          <Galeria fotos={fotos} nombre={lugar.nombre} estilo={estilo} />
        </div>

        <header className="lg:col-start-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                style={{ backgroundColor: `${estilo.color}1f`, color: estilo.color }}
              >
                {lugar.categoria}
              </span>
              <h1 className="mt-2 text-2xl font-extrabold text-esmeralda-900 sm:text-3xl">{lugar.nombre}</h1>
            </div>
            <BotonFavorito
              lugarId={lugar.id}
              inicial={esFavorito}
              haySesion={Boolean(sesion)}
              className="shrink-0 !h-10 !w-10 ring-1 ring-esmeralda-200"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
            {lugar.total_resenas > 0 ? (
              <a href="#resenas" className="flex items-center gap-2 hover:underline">
                <Estrellas valor={lugar.calificacion_promedio} />
                <span className="font-semibold text-gray-800">{lugar.calificacion_promedio}</span>
                <span>
                  ({lugar.total_resenas} {lugar.total_resenas === 1 ? "reseña" : "reseñas"})
                </span>
              </a>
            ) : (
              <a href="#resenas" className="hover:underline">
                Sin reseñas todavía
              </a>
            )}
            {lugar.direccion && (
              <span className="flex items-center gap-1">
                <MapPin size={15} aria-hidden="true" />
                {lugar.direccion}
              </span>
            )}
          </div>
        </header>

        {/* Columna lateral: acciones, horarios y mapa. En celular queda justo debajo del encabezado. */}
        <aside className="space-y-4 lg:col-start-2 lg:row-span-6 lg:row-start-1 lg:self-start">
          <Card className="space-y-2.5">
            <Button
              href={rutaGoogleMaps(lugar.latitud, lugar.longitud)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Navigation size={16} aria-hidden="true" />
              Cómo llegar
            </Button>
            {telefono && (
              <Button href={telefono} variante="secundario" className="w-full">
                <Phone size={16} aria-hidden="true" />
                {lugar.telefono}
              </Button>
            )}
            {web && (
              <Button href={web} target="_blank" rel="noopener noreferrer" variante="secundario" className="w-full">
                <Globe size={16} aria-hidden="true" />
                Sitio web
              </Button>
            )}
          </Card>

          <Card>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-esmeralda-900">Horarios</h2>
            {estado.conocido && (
              <p
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                  estado.abierto ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                }`}
              >
                {estado.texto}
              </p>
            )}
            {lugar.horarios.length > 0 ? (
              <ul className="mt-3 space-y-1 text-sm">
                {dias.map((d) => (
                  <li
                    key={d.dia}
                    className={`flex justify-between gap-3 rounded-lg px-2 py-1 ${
                      d.dia === hoy ? "bg-esmeralda-50 font-semibold text-esmeralda-900" : "text-gray-700"
                    }`}
                  >
                    <span>{d.nombre}</span>
                    <span className="text-right">
                      {d.sinDatos
                        ? "—"
                        : d.cerrado
                          ? "Cerrado"
                          : d.franjas.map((f) => `${formatoHora(f.abre)} – ${formatoHora(f.cierra)}`).join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Horario no disponible.</p>
            )}
          </Card>

          <Card className="overflow-hidden !p-0">
            <Mapa
              lugares={[lugar]}
              categorias={categorias}
              leyenda={false}
              className="h-56 w-full"
            />
            {lugar.direccion && <p className="p-4 text-sm text-gray-600">{lugar.direccion}</p>}
          </Card>
        </aside>

        {lugar.descripcion && (
          <section aria-labelledby="titulo-acerca" className="lg:col-start-1">
            <h2 id="titulo-acerca" className="text-lg font-extrabold uppercase tracking-wide text-esmeralda-900">
              Acerca de este lugar
            </h2>
            <p className="mt-2 whitespace-pre-line text-gray-700">{lugar.descripcion}</p>
          </section>
        )}

        {promociones.length > 0 && (
          <section aria-labelledby="titulo-promos" className="lg:col-start-1">
            <h2 id="titulo-promos" className="text-lg font-extrabold uppercase tracking-wide text-esmeralda-900">
              Promociones
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {promociones.map((p) => (
                <li key={p.id} className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                  <p className="flex items-center gap-2 font-semibold text-amber-900">
                    <Tag size={16} aria-hidden="true" />
                    {p.titulo}
                  </p>
                  {p.descripcion && <p className="mt-1 text-sm text-amber-900/80">{p.descripcion}</p>}
                  {p.termina && <p className="mt-2 text-xs font-medium text-amber-800">Hasta el {fechaCorta(p.termina)}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="lg:col-start-1">
          <ResenasLugar lugar={lugar} sesion={sesion} />
        </div>
      </div>
    </article>
  );
}
