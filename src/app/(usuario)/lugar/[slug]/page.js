import { notFound } from "next/navigation";
import DetalleLugar from "@/components/lugares/DetalleLugar";
import { getCategorias } from "@/services/categorias";
import { getFavoritosIds } from "@/services/favoritos";
import { getLugarPorSlug } from "@/services/lugares";
import { getSesion } from "@/services/sesion";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const lugar = await getLugarPorSlug(slug);
  if (!lugar) return { title: "Lugar no encontrado · Ruta Esmeralda" };

  const titulo = `${lugar.nombre} · Ruta Esmeralda`;
  const descripcion = lugar.descripcion?.slice(0, 160);
  return {
    title: titulo,
    description: descripcion,
    openGraph: { title: titulo, description: descripcion, images: lugar.portada_url ? [lugar.portada_url] : undefined },
  };
}

export default async function LugarPage({ params }) {
  const { slug } = await params;
  const [lugar, categorias, sesion, favoritosIds] = await Promise.all([
    getLugarPorSlug(slug),
    getCategorias(),
    getSesion(),
    getFavoritosIds(),
  ]);

  if (!lugar) notFound();

  return (
    <DetalleLugar
      lugar={lugar}
      categoria={categorias.find((c) => c.id === lugar.categoria_id)}
      categorias={categorias}
      sesion={sesion}
      esFavorito={favoritosIds.includes(lugar.id)}
    />
  );
}
