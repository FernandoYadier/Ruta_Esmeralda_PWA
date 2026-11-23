import Image from "next/image";
import Link from "next/link";
import BotonEliminarResena from "@/components/lugares/BotonEliminarResena";
import Estrellas from "@/components/lugares/Estrellas";
import Button from "@/components/ui/Button";

const fechaLarga = (iso) =>
  new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Mexico_City",
  });

// Lista de las reseñas que escribió la persona, con su lugar, fotos y botón para eliminar.
export default function MisResenas({ resenas }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-esmeralda-900">Mis reseñas</h2>

      {resenas.length === 0 ? (
        <div className="rounded-2xl bg-esmeralda-50 p-5 text-center ring-1 ring-esmeralda-100">
          <p className="text-sm text-gray-700">Todavía no has escrito reseñas. ¡Cuéntanos qué lugares conoces!</p>
          <div className="mt-3">
            <Button href="/explorar">Explorar lugares</Button>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-esmeralda-100">
          {resenas.map((resena) => {
            const lugar = resena.lugares; // puede venir vacío si el lugar ya no está publicado
            const fotos = resena.resena_fotos ?? [];
            return (
              <li key={resena.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {lugar ? (
                    <Link
                      href={`/lugar/${lugar.slug}`}
                      className="font-semibold text-esmeralda-800 hover:underline"
                    >
                      {lugar.nombre}
                    </Link>
                  ) : (
                    <p className="font-semibold text-gray-600">Lugar no disponible</p>
                  )}
                  <BotonEliminarResena resenaId={resena.id} fotos={fotos.map((foto) => foto.url)} />
                </div>

                <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                  <Estrellas valor={resena.calificacion} size={14} />
                  <time dateTime={resena.created_at}>{fechaLarga(resena.created_at)}</time>
                </div>

                {resena.comentario && (
                  <p className="mt-2 whitespace-pre-line break-words text-sm text-gray-700">{resena.comentario}</p>
                )}

                {fotos.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {fotos.map((foto, indice) => (
                      <li key={foto.id}>
                        <Link href={foto.url} target="_blank" rel="noopener noreferrer">
                          <Image
                            src={foto.url}
                            alt={`Foto ${indice + 1} de tu reseña de ${lugar?.nombre ?? "un lugar"}`}
                            width={96}
                            height={96}
                            className="h-24 w-24 rounded-xl object-cover"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}