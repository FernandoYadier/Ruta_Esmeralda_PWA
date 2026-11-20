import Button from "@/components/ui/Button";

// Se muestra cuando una página pide un lugar que no existe (por ejemplo, /lugar/algo-que-no-existe).
export default function NoEncontrado() {
  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-5xl font-extrabold text-esmeralda-700">404</p>
      <h1 className="mt-3 text-2xl font-extrabold uppercase tracking-tight text-esmeralda-900">
        No encontramos esta página
      </h1>
      <p className="mt-2 text-gray-600">Puede que el lugar ya no esté disponible o que la dirección tenga un error.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button href="/explorar">Explorar lugares</Button>
        <Button href="/" variante="secundario">
          Ir al inicio
        </Button>
      </div>
    </section>
  );
}
