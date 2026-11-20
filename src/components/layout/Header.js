import Link from "next/link";
import Logo from "@/components/layout/Logo";
import NavLink from "@/components/layout/NavLink";
import Button from "@/components/ui/Button";
import { getSesion } from "@/services/sesion";
import { cerrarSesion } from "@/services/auth";

const enlaces = [
  { href: "/explorar", etiqueta: "Explora" },
  { href: "/mapa", etiqueta: "Mapa" },
  { href: "/recorridos", etiqueta: "Planea tu ruta" },
  { href: "/favoritos", etiqueta: "Favoritos" },
  { href: "/acerca-de", etiqueta: "Acerca de" },
];

export default async function Header() {
  const sesion = await getSesion();
  const inicial = (sesion?.nombre || sesion?.correo || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-esmeralda-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Ruta Esmeralda, ir al inicio">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {enlaces.map(({ href, etiqueta }) => (
            <NavLink
              key={href}
              href={href}
              className="border-b-2 px-4 py-2 text-xs font-bold uppercase tracking-wide transition"
              activoClassName="border-esmeralda-600 text-esmeralda-700"
              inactivoClassName="border-transparent text-gray-700 hover:text-esmeralda-700"
            >
              {etiqueta}
            </NavLink>
          ))}
        </nav>

        {/* Más adelante: selector de idioma. */}
        {sesion ? (
          <div className="flex items-center gap-2">
            {sesion.rol === "admin" && (
              <Button href="/admin" variante="fantasma" className="hidden xl:inline-flex">
                Administración
              </Button>
            )}
            {sesion.rol === "establecimiento" && (
              <Button href="/establecimiento" variante="fantasma" className="hidden xl:inline-flex">
                Mi negocio
              </Button>
            )}
            <Link
              href="/perfil"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold text-esmeralda-900 hover:bg-esmeralda-50"
            >
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-esmeralda-700 text-sm font-semibold text-white"
              >
                {inicial}
              </span>
              <span className="hidden max-w-32 truncate sm:inline">{sesion.nombre || "Mi perfil"}</span>
            </Link>
            <form action={cerrarSesion} className="hidden sm:block">
              <Button type="submit" variante="secundario" className="px-4 py-2">
                Salir
              </Button>
            </form>
          </div>
        ) : (
          <Button href="/login">Iniciar sesión</Button>
        )}
      </div>
    </header>
  );
}
