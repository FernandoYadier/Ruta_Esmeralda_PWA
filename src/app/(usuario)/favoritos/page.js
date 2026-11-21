import FavoritosVista from "@/components/favoritos/FavoritosVista";
import { getCategorias } from "@/services/categorias";
import { getFavoritos } from "@/services/favoritos";
import { getSesion } from "@/services/sesion";

export const metadata = { title: "Mis favoritos · Ruta Esmeralda" };

// La categoría activa viaja en la dirección (?categoria=slug): se puede compartir y guardar.
// El proxy ya manda a /login a quien no ha iniciado sesión.
export default async function FavoritosPage({ searchParams }) {
  const params = await searchParams;
  const categoria = typeof params.categoria === "string" ? params.categoria : "";

  const [favoritos, categorias, sesion] = await Promise.all([getFavoritos(), getCategorias(), getSesion()]);

  return (
    <FavoritosVista
      favoritos={favoritos}
      categorias={categorias}
      categoriaSlug={categoria}
      haySesion={Boolean(sesion)}
    />
  );
}