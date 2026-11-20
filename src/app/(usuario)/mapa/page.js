import Mapa from "@/components/mapa/Mapa";
import { getCategorias } from "@/services/categorias";
import { getLugares } from "@/services/lugares";

export const metadata = { title: "Mapa · Ruta Esmeralda" };

export default async function MapaPage() {
  const [lugares, categorias] = await Promise.all([getLugares({ limite: 500 }), getCategorias()]);

  return (
    <Mapa
      lugares={lugares}
      categorias={categorias}
      zoomConRueda
      className="h-[calc(100dvh-9rem)] w-full lg:h-[calc(100dvh-8.5rem)]"
    />
  );
}
