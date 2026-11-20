"use client";

import { House, Compass, Map, Route, Heart } from "lucide-react";
import NavLink from "@/components/layout/NavLink";

const items = [
  { href: "/", etiqueta: "Inicio", exacto: true, Icono: House },
  { href: "/explorar", etiqueta: "Explora", Icono: Compass },
  { href: "/mapa", etiqueta: "Mapa", Icono: Map },
  { href: "/recorridos", etiqueta: "Mi ruta", Icono: Route },
  { href: "/favoritos", etiqueta: "Favoritos", Icono: Heart },
];

// Barra inferior para celular y tableta (se oculta en pantallas grandes, donde el menú va arriba).
export default function BottomNav() {
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-esmeralda-100 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-md justify-around">
        {items.map(({ href, etiqueta, exacto, Icono }) => (
          <li key={href}>
            <NavLink
              href={href}
              exacto={exacto}
              className="flex flex-col items-center gap-0.5 px-3 py-2 text-xs"
              activoClassName="font-semibold text-esmeralda-700"
              inactivoClassName="text-gray-500"
            >
              <Icono size={22} aria-hidden="true" />
              {etiqueta}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
