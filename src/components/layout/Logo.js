import Image from "next/image";

// Logo de Ruta Esmeralda: el monograma "RE" con la hoja y, opcionalmente, el nombre.
export default function Logo({ conTexto = true, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo/logo-icono.png"
        alt={conTexto ? "" : "Ruta Esmeralda"}
        width={561}
        height={413}
        priority
        className="h-9 w-auto"
      />
      {conTexto && (
        <span className="text-[0.72rem] font-extrabold uppercase leading-[1.15] tracking-wider text-esmeralda-800">
          Ruta
          <br />
          Esmeralda
        </span>
      )}
    </span>
  );
}
