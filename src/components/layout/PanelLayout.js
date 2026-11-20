import Link from "next/link";
import Logo from "@/components/layout/Logo";
import NavLink from "@/components/layout/NavLink";

// Estructura compartida por el panel de establecimientos y el módulo administrativo:
// barra lateral en pantallas medianas y grandes, y pestañas con scroll horizontal en celular.
export default function PanelLayout({ titulo, items, children }) {
  return (
    <div className="min-h-screen bg-esmeralda-50 md:flex">
      <aside className="border-b border-esmeralda-100 bg-white md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex h-16 items-center px-4">
          <Link href="/" aria-label="Ruta Esmeralda, ir al sitio">
            <Logo />
          </Link>
        </div>
        <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-esmeralda-700">
          {titulo}
        </p>
        <nav aria-label={titulo} className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {items.map(({ href, etiqueta, exacto }) => (
            <NavLink
              key={href}
              href={href}
              exacto={exacto}
              className="whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition"
              activoClassName="bg-esmeralda-50 text-esmeralda-800"
              inactivoClassName="text-gray-600 hover:bg-esmeralda-50 hover:text-esmeralda-800"
            >
              {etiqueta}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
