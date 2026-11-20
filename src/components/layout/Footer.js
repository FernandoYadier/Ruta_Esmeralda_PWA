import Link from "next/link";
import { REDES } from "@/lib/sitio";

const enlaces = [
  { href: "/explorar", etiqueta: "Explora" },
  { href: "/recorridos", etiqueta: "Planea tu ruta" },
  { href: "/favoritos", etiqueta: "Favoritos" },
  { href: "/acerca-de", etiqueta: "Acerca de" },
];

export default function Footer() {
  return (
    <footer className="bg-esmeralda-900 text-esmeralda-50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-sm md:flex-row">
        <nav aria-label="Pie de página" className="flex flex-wrap justify-center gap-x-5 gap-y-1">
          {enlaces.map(({ href, etiqueta }) => (
            <Link key={href} href={href} className="hover:underline">
              {etiqueta}
            </Link>
          ))}
        </nav>

        {REDES.length > 0 && (
          <ul className="flex gap-4">
            {REDES.map(({ nombre, url }) => (
              <li key={nombre}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {nombre}
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="text-center text-esmeralda-100">Ruta Esmeralda · Explora tu camino.</p>
      </div>
    </footer>
  );
}
