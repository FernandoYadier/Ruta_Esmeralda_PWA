"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import TarjetaLugar from "@/components/lugares/TarjetaLugar";
import Button from "@/components/ui/Button";
import { estiloCategoria } from "@/lib/categorias-estilo";

// Arma la dirección de /favoritos con la categoría activa.
function urlFavoritos(categoria) {
  return categoria ? `/favoritos?categoria=${encodeURIComponent(categoria)}` : "/favoritos";
}

// Presentación de la pantalla Favoritos (la página se encarga de pedir los datos).
// Es Client Component para poder refrescar la lista cuando se quita un favorito.
export default function FavoritosVista({ favoritos, categorias, categoriaSlug = "", haySesion = false }) {
  const router = useRouter();

  const categoriaPorId = Object.fromEntries(categorias.map((c) => [c.id, c]));

  // Solo se muestran las categorías que tienen al menos un favorito.
  const idsConFavoritos = new Set(favoritos.map((l) => l.categoria_id));
  const categoriasConFavoritos = categorias.filter((c) => idsConFavoritos.has(c.id));

  // Si la categoría de la dirección ya no tiene favoritos (o no existe), se muestran todos.
  const categoriaActiva = categoriasConFavoritos.find((c) => c.slug === categoriaSlug);
  const visibles = categoriaActiva ? favoritos.filter((l) => l.categoria_id === categoriaActiva.id) : favoritos;

  const total = favoritos.length;
  const resumen = `${total} ${total === 1 ? "lugar guardado" : "lugares guardados"}`;

  // Cuando se quita un corazón, se vuelve a pedir la lista al servidor y la tarjeta desaparece.
  function alCambiarFavorito(guardado) {
    if (!guardado) router.refresh();
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-esmeralda-900 sm:text-3xl">
        Mis favoritos
      </h1>
      <p className="mt-1 text-sm font-medium text-gray-600" aria-live="polite">
        {resumen}
      </p>

      {total === 0 ? (
        <div className="mt-6 rounded-3xl bg-esmeralda-50 p-8 text-center ring-1 ring-esmeralda-100">
          <Heart size={36} aria-hidden="true" className="mx-auto text-esmeralda-700" />
          <p className="mt-3 font-semibold text-esmeralda-900">Aún no tienes favoritos</p>
          <p className="mt-1 text-sm text-gray-600">
            Toca el corazón de un lugar para guardarlo y encontrarlo aquí cuando quieras.
          </p>
          <div className="mt-4">
            <Button href="/explorar">Explorar lugares</Button>
          </div>
        </div>
      ) : (
        <>
          {/* Filtro por categoría */}
          <nav aria-label="Categorías" className="mt-4 flex flex-wrap gap-2">
            <Link
              href={urlFavoritos("")}
              aria-current={!categoriaActiva ? "true" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                !categoriaActiva
                  ? "bg-esmeralda-900 text-white"
                  : "bg-white text-gray-700 ring-1 ring-esmeralda-200 hover:bg-esmeralda-50"
              }`}
            >
              Todas
            </Link>
            {categoriasConFavoritos.map((c) => {
              const estilo = estiloCategoria(c.slug);
              const activa = c.slug === categoriaActiva?.slug;
              return (
                <Link
                  key={c.id}
                  href={urlFavoritos(c.slug)}
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

          <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visibles.map((lugar) => (
              <li key={lugar.id}>
                <TarjetaLugar
                  lugar={lugar}
                  categoria={categoriaPorId[lugar.categoria_id]}
                  favorito={true}
                  haySesion={haySesion}
                  onCambioFavorito={alCambiarFavorito}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}