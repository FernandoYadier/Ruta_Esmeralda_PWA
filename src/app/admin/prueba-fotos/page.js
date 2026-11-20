import { getLugares } from "@/services/lugares";
import PruebaFotos from "./PruebaFotos";

// PÁGINA TEMPORAL para comprobar que las fotos funcionan de punta a punta.
// Cuando todo funcione se puede borrar esta carpeta completa.
export default async function PruebaFotosPage() {
  const lugares = await getLugares();

  return (
    <section className="max-w-xl">
      <h1 className="text-2xl font-semibold text-esmeralda-900">Prueba de fotos (temporal)</h1>
      <p className="mt-2 text-sm text-gray-600">
        Sube una foto a un lugar. Se guarda en Storage, se registra en la tabla de fotos y, si el lugar
        no tenía portada, queda como portada.
      </p>
      <PruebaFotos lugares={lugares.map(({ id, nombre }) => ({ id, nombre }))} />
    </section>
  );
}
