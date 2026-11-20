import { Landmark, Trees, UtensilsCrossed, Ticket, BedDouble, ShoppingBag, Cross, MapPin } from "lucide-react";

// Etiqueta corta, color e ícono de cada categoría (la llave es el "slug" de la tabla categorias).
// Se usan en los pines del mapa, las etiquetas de las tarjetas y la leyenda.
export const ESTILOS_CATEGORIA = {
  "cultura-e-historia": { etiqueta: "Cultura", color: "#2f6fb5", icono: Landmark },
  "naturaleza-y-parques": { etiqueta: "Naturaleza", color: "#2e9e5b", icono: Trees },
  gastronomia: { etiqueta: "Gastronomía", color: "#f08a24", icono: UtensilsCrossed },
  "recreacion-y-diversion": { etiqueta: "Recreación", color: "#8b5cf6", icono: Ticket },
  hospedaje: { etiqueta: "Hospedaje", color: "#0e9aa7", icono: BedDouble },
  compras: { etiqueta: "Compras", color: "#d9467a", icono: ShoppingBag },
  servicios: { etiqueta: "Servicios", color: "#64748b", icono: Cross },
};

const ESTILO_POR_DEFECTO = { etiqueta: "Lugar", color: "#64748b", icono: MapPin };

export function estiloCategoria(slug) {
  return ESTILOS_CATEGORIA[slug] ?? ESTILO_POR_DEFECTO;
}
