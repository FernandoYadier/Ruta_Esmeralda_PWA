export const metadata = { title: "Acerca de · Ruta Esmeralda" };

// Página provisional: el texto final lo define el equipo.
export default function AcercaDePage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-extrabold uppercase tracking-tight text-esmeralda-900">Acerca de Ruta Esmeralda</h1>
      <p className="mt-4 text-gray-700">
        Ruta Esmeralda es una plataforma para descubrir Villahermosa, Tabasco: lugares, establecimientos y recorridos
        personalizados según tus intereses y el tiempo que te quedes en la ciudad, ya seas turista o te estés mudando.
      </p>
    </section>
  );
}
