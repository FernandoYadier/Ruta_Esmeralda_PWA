import ExplorarVista from "@/components/explorar/ExplorarVista";
import { getCategorias } from "@/services/categorias";
import { getFavoritosIds } from "@/services/favoritos";
import { buscarLugares } from "@/services/lugares";
import { getSesion } from "@/services/sesion";

export const metadata = { title: "Explora · Ruta Esmeralda" };

const POR_PAGINA = 12;

// Los filtros viajan en la dirección (?q=...&categoria=...&orden=...&pagina=...): se pueden compartir y guardar.
export default async function ExplorarPage({ searchParams }) {
  const params = await searchParams;
  const texto = (valor) => (typeof valor === "string" ? valor : "");

  const q = texto(params.q).trim().slice(0, 80);
  const slugCategoria = texto(params.categoria);
  const orden = params.orden === "nombre" ? "nombre" : "recomendados";
  const pagina = Math.max(1, Number.parseInt(texto(params.pagina), 10) || 1);

  const [categorias, sesion, favoritosIds] = await Promise.all([getCategorias(), getSesion(), getFavoritosIds()]);
  const categoria = categorias.find((c) => c.slug === slugCategoria);

  const { lugares, total } = await buscarLugares({
    categoriaId: categoria?.id,
    busqueda: q,
    orden,
    pagina,
    porPagina: POR_PAGINA,
  });

  return (
    <ExplorarVista
      lugares={lugares}
      total={total}
      categorias={categorias}
      filtros={{ q, categoria: categoria?.slug ?? "", orden, pagina }}
      porPagina={POR_PAGINA}
      favoritosIds={favoritosIds}
      haySesion={Boolean(sesion)}
    />
  );
}
