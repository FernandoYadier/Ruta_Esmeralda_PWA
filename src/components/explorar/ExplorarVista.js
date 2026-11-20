import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import TarjetaLugar from "@/components/lugares/TarjetaLugar";
import Button from "@/components/ui/Button";
import { estiloCategoria } from "@/lib/categorias-estilo";

// Arma la dirección de /explorar con los filtros activos (omite los valores por defecto).
export function urlExplorar({ q, categoria, orden, pagina } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (categoria) params.set("categoria", categoria);
  if (orden && orden !== "recomendados") params.set("orden", orden);
  if (pagina && pagina > 1) params.set("pagina", String(pagina));
  const texto = params.toString();
  return texto ? `/explorar?${texto}` : "/explorar";
}

// Presentación de la pantalla Explorar (la página se encarga de pedir los datos).
export default function ExplorarVista({
  lugares,
  total,
  categorias,
  filtros,
  porPagina,
  favoritosIds = [],
  haySesion = false,
}) {
  const { q = "", categoria = "", orden = "recomendados", pagina = 1 } = filtros;
  const categoriaPorId = Object.fromEntries(categorias.map((c) => [c.id, c]));
  const favoritos = new Set(favoritosIds);
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const hayFiltros = Boolean(q || categoria);
  const categoriaActiva = categorias.find((c) => c.slug === categoria);

  const resumen =
    total === 0
      ? "Sin resultados"
      : `${total} ${total === 1 ? "lugar" : "lugares"}${q ? ` para “${q}”` : ""}${
          categoriaActiva ? ` en ${categoriaActiva.nombre}` : ""
        }`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-esmeralda-900 sm:text-3xl">
        Explora Villahermosa
      </h1>
      <p className="mt-1 text-sm text-gray-600">Lugares, sabores y rincones para descubrir en la ciudad.</p>

      {/* Búsqueda: es un formulario normal (GET), funciona incluso sin JavaScript */}
      <form action="/explorar" method="get" role="search" className="mt-5 flex flex-col gap-3 sm:flex-row">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <label className="relative flex-1">
          <span className="sr-only">Buscar por nombre</span>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={80}
            placeholder="Buscar por nombre…"
            className="w-full rounded-full border border-esmeralda-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-1 focus:outline-esmeralda-600"
          />
        </label>
        <label>
          <span className="sr-only">Ordenar por</span>
          <select
            name="orden"
            defaultValue={orden}
            className="w-full rounded-full border border-esmeralda-200 bg-white px-4 py-2.5 text-sm text-gray-900 sm:w-auto"
          >
            <option value="recomendados">Más recomendados</option>
            <option value="nombre">Nombre (A–Z)</option>
          </select>
        </label>
        <Button type="submit">Buscar</Button>
      </form>

      {/* Filtro por categoría */}
      <nav aria-label="Categorías" className="mt-4 flex flex-wrap gap-2">
        <Link
          href={urlExplorar({ q, orden })}
          aria-current={!categoria ? "true" : undefined}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            !categoria
              ? "bg-esmeralda-900 text-white"
              : "bg-white text-gray-700 ring-1 ring-esmeralda-200 hover:bg-esmeralda-50"
          }`}
        >
          Todas
        </Link>
        {categorias.map((c) => {
          const estilo = estiloCategoria(c.slug);
          const activa = c.slug === categoria;
          return (
            <Link
              key={c.id}
              href={urlExplorar({ q, orden, categoria: c.slug })}
              aria-current={activa ? "true" : undefined}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                activa ? "text-white" : "bg-white text-gray-700 ring-1 ring-esmeralda-200 hover:bg-esmeralda-50"
              }`}
              style={activa ? { backgroundColor: estilo.color } : undefined}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: activa ? "#fff" : estilo.color }}
              />
              {estilo.etiqueta}
            </Link>
          );
        })}
      </nav>

      <p className="mt-6 text-sm font-medium text-gray-600" aria-live="polite">
        {resumen}
      </p>

      {lugares.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {lugares.map((lugar) => (
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
      ) : (
        <div className="mt-4 rounded-3xl bg-esmeralda-50 p-8 text-center ring-1 ring-esmeralda-100">
          <p className="font-semibold text-esmeralda-900">
            {total > 0 ? "Esta página no tiene lugares." : "No encontramos lugares con esos filtros."}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {total > 0 ? "Vuelve al inicio del listado." : "Prueba con otras palabras o con otra categoría."}
          </p>
          <div className="mt-4">
            <Button href={total > 0 ? urlExplorar({ q, categoria, orden }) : "/explorar"} variante="secundario">
              {hayFiltros || total > 0 ? "Ver resultados" : "Ver todos los lugares"}
            </Button>
          </div>
        </div>
      )}

      {totalPaginas > 1 && lugares.length > 0 && (
        <nav aria-label="Paginación" className="mt-8 flex items-center justify-center gap-3 text-sm">
          {pagina > 1 ? (
            <Link
              href={urlExplorar({ q, categoria, orden, pagina: pagina - 1 })}
              rel="prev"
              className="flex items-center gap-1 rounded-full px-4 py-2 font-semibold text-esmeralda-800 ring-1 ring-esmeralda-200 hover:bg-esmeralda-50"
            >
              <ChevronLeft size={16} aria-hidden="true" /> Anterior
            </Link>
          ) : (
            <span aria-hidden="true" className="w-[6.5rem]" />
          )}
          <span className="font-medium text-gray-600">
            Página {pagina} de {totalPaginas}
          </span>
          {pagina < totalPaginas ? (
            <Link
              href={urlExplorar({ q, categoria, orden, pagina: pagina + 1 })}
              rel="next"
              className="flex items-center gap-1 rounded-full px-4 py-2 font-semibold text-esmeralda-800 ring-1 ring-esmeralda-200 hover:bg-esmeralda-50"
            >
              Siguiente <ChevronRight size={16} aria-hidden="true" />
            </Link>
          ) : (
            <span aria-hidden="true" className="w-[6.5rem]" />
          )}
        </nav>
      )}
    </section>
  );
}
