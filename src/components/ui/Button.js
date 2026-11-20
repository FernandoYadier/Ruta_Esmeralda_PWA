import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-esmeralda-700 disabled:pointer-events-none disabled:opacity-50";

const variantes = {
  primario: "bg-esmeralda-700 text-white hover:bg-esmeralda-800",
  secundario: "border border-esmeralda-700 text-esmeralda-700 hover:bg-esmeralda-50",
  fantasma: "text-esmeralda-800 hover:bg-esmeralda-100",
};

// Si recibe "href" se comporta como enlace; si no, como botón.
export default function Button({ href, variante = "primario", className = "", children, ...props }) {
  const clases = `${base} ${variantes[variante]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={clases} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={clases} {...props}>
      {children}
    </button>
  );
}
