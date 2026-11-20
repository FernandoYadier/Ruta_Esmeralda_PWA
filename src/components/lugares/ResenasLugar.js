import Image from "next/image";
import Link from "next/link";
import BotonEliminarResena from "@/components/lugares/BotonEliminarResena";
import Estrellas from "@/components/lugares/Estrellas";
import FormularioResena from "@/components/lugares/FormularioResena";
import Button from "@/components/ui/Button";

const fechaLarga = (iso) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Mexico_City" });

// Sección de reseñas: resumen, formulario (si hay sesión) y lista.
export default function ResenasLugar({ lugar, sesion }) {
  const { resenas } = lugar;
  const miResena = sesion ? resenas.find((r) => r.usuario_id === sesion.id) : null;
  const total = resenas.length;
  const conteo = [5, 4, 3, 2, 1].map((n) => ({ n, cantidad: resenas.filter((r) => r.calificacion === n).length }));

  return (
    <section id="resenas" aria-labelledby="titulo-resenas" className="scroll-mt-24">
      <h2 id="titulo-resenas" className="text-lg font-extrabold uppercase tracking-wide text-esmeralda-900">
        Reseñas
      </h2>

      {total > 0 ? (
        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="text-center sm:w-36">
            <p className="text-4xl font-extrabold text-esmeralda-900">{lugar.calificacion_promedio}</p>
            <Estrellas valor={lugar.calificacion_promedio} size={18} />
            <p className="mt-1 text-xs text-gray-500">
              {total} {total === 1 ? "reseña" : "reseñas"}
            </p>
          </div>
          <ul className="flex-1 space-y-1.5" aria-label="Distribución de calificaciones">
            {conteo.map(({ n, cantidad }) => (
              <li key={n} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-3 text-right font-semibold">{n}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-esmeralda-100">
                  <span
                    className="block h-full rounded-full bg-amber-400"
                    style={{ width: `${(cantidad / total) * 100}%` }}
                  />
                </span>
                <span className="w-5">{cantidad}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-600">Todavía no hay reseñas. ¡Sé la primera persona en opinar!</p>
      )}

      <div className="mt-6">
        {!sesion && (
          <div className="rounded-2xl bg-esmeralda-50 p-5 text-center ring-1 ring-esmeralda-100">
            <p className="text-sm text-gray-700">Inicia sesión para escribir una reseña.</p>
            <div className="mt-3">
              <Button href={`/login?next=${encodeURIComponent(`/lugar/${lugar.slug}`)}`}>Iniciar sesión</Button>
            </div>
          </div>
        )}
        {sesion && !miResena && <FormularioResena lugarId={lugar.id} usuarioId={sesion.id} />}
      </div>

      {total > 0 && (
        <ul className="mt-6 divide-y divide-esmeralda-100">
          {[...resenas]
            .sort((a, b) => (b.usuario_id === sesion?.id) - (a.usuario_id === sesion?.id))
            .map((resena) => {
              const esMia = resena.usuario_id === sesion?.id;
              const nombre = resena.autor?.nombre || "Anónimo";
              return (
                <li key={resena.id} className="py-5 first:pt-0">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-esmeralda-700 text-sm font-semibold text-white"
                    >
                      {nombre.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-esmeralda-900">
                          {nombre}
                          {esMia && (
                            <span className="ml-2 rounded-full bg-esmeralda-100 px-2 py-0.5 text-xs font-semibold text-esmeralda-800">
                              Tu reseña
                            </span>
                          )}
                        </p>
                        {esMia && <BotonEliminarResena resenaId={resena.id} fotos={resena.resena_fotos.map((f) => f.url)} />}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                        <Estrellas valor={resena.calificacion} size={14} />
                        <time dateTime={resena.created_at}>{fechaLarga(resena.created_at)}</time>
                      </div>
                      {resena.comentario && <p className="mt-2 whitespace-pre-line text-sm text-gray-700">{resena.comentario}</p>}
                      {resena.resena_fotos.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {resena.resena_fotos.map((foto, indice) => (
                            <li key={foto.id}>
                              <Link href={foto.url} target="_blank" rel="noopener noreferrer">
                                <Image
                                  src={foto.url}
                                  alt={`Foto ${indice + 1} de la reseña de ${nombre}`}
                                  width={96}
                                  height={96}
                                  className="h-24 w-24 rounded-xl object-cover"
                                />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </section>
  );
}
