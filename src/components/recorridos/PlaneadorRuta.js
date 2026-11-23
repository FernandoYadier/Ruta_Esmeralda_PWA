"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Sparkles } from "lucide-react";
import Mapa from "@/components/mapa/Mapa";
import ItinerarioDias from "@/components/recorridos/ItinerarioDias";
import Button from "@/components/ui/Button";
import { estiloCategoria } from "@/lib/categorias-estilo";
import { createClient } from "@/lib/supabase/client";
import {
  DURACIONES,
  armarDias,
  formatoDuracion,
  generarRecorridoParaPersona,
  itemsDesdeLugares,
  minutosVisita,
  moverItem,
  quitarItem,
} from "@/lib/recorridos";

const MAX_PARADAS = 30; // el mismo límite que tiene la función guardar_recorrido en la base

// Planeador: la persona genera un recorrido, lo ajusta (subir, bajar, quitar, agregar) y lo guarda.
// "inicial" = { duracion, intereses: [ids de categorías], idsLugares: [ids] } para abrirlo ya armado.
export default function PlaneadorRuta({ lugares, categorias, inicial, haySesion = false }) {
  const router = useRouter();
  const categoriaPorId = Object.fromEntries(categorias.map((c) => [c.id, c]));
  const lugarPorId = Object.fromEntries(lugares.map((l) => [l.id, l]));

  const [duracion, setDuracion] = useState(inicial.duracion);
  const [intereses, setIntereses] = useState(inicial.intereses);
  const [items, setItems] = useState(() =>
    itemsDesdeLugares(inicial.idsLugares.map((id) => lugarPorId[id]).filter(Boolean), categorias),
  );
  const [titulo, setTitulo] = useState(DURACIONES[inicial.duracion].titulo);
  const [sinResultados, setSinResultados] = useState(false);
  const [lugarAgregar, setLugarAgregar] = useState("");
  const [guardado, setGuardado] = useState(null); // { id } cuando se acaba de guardar
  const [estado, setEstado] = useState({ guardando: false, error: "" });

  const plan = armarDias(items, { porDia: DURACIONES[duracion].porDia });
  const disponibles = lugares
    .filter((l) => !items.some((i) => i.lugar.id === l.id))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  function cambiarItems(nuevos) {
    setItems(nuevos);
    setGuardado(null); // cualquier ajuste deja el recorrido como "sin guardar"
  }

  function alternarInteres(id) {
    setIntereses((actuales) => (actuales.includes(id) ? actuales.filter((i) => i !== id) : [...actuales, id]));
  }

  function generar(evento) {
    evento.preventDefault();
    const resultado = generarRecorridoParaPersona(lugares, categorias, { duracion, categoriaIds: intereses });
    setItems(itemsDesdeLugares(resultado.paradas.map((p) => p.lugar), categorias));
    setSinResultados(resultado.paradas.length === 0);
    setTitulo(DURACIONES[duracion].titulo);
    setGuardado(null);
    setEstado({ guardando: false, error: "" });
  }

  function agregar() {
    const lugar = lugarPorId[lugarAgregar];
    if (!lugar || items.length >= MAX_PARADAS) return;
    cambiarItems([...items, { lugar, minutos: minutosVisita(categoriaPorId[lugar.categoria_id]?.slug) }]);
    setLugarAgregar("");
    setSinResultados(false);
  }

  async function guardar(evento) {
    evento.preventDefault();
    const nombre = titulo.trim();
    if (!nombre) {
      setEstado({ guardando: false, error: "Ponle un nombre a tu recorrido." });
      return;
    }
    setEstado({ guardando: true, error: "" });

    // El recorrido y todas sus paradas se guardan en un solo paso (función de la base de datos).
    const supabase = createClient();
    const paradas = plan.dias.flatMap((d) => d.paradas).map((p) => ({ lugar_id: p.lugar.id, dia: p.dia, duracion_min: p.minutos }));
    const { data, error } = await supabase.rpc("guardar_recorrido", { p_titulo: nombre, p_paradas: paradas });

    if (error) {
      setEstado({ guardando: false, error: "No pudimos guardar tu recorrido. Inténtalo de nuevo." });
      return;
    }
    setGuardado({ id: data });
    setEstado({ guardando: false, error: "" });
    router.refresh(); // actualiza la lista «Mis recorridos»
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex min-w-0 flex-col gap-6">
        {/* ---- Formulario ---- */}
        <section aria-labelledby="titulo-armar" className="rounded-3xl bg-esmeralda-100/70 p-5 ring-1 ring-esmeralda-200">
          <h2 id="titulo-armar" className="text-sm font-extrabold uppercase tracking-wide text-esmeralda-900">
            Arma tu recorrido
          </h2>
          <form onSubmit={generar} className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,12rem)_1fr]">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-esmeralda-900">
              ¿Cuánto tiempo te quedas?
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="rounded-xl border border-esmeralda-200 bg-white px-3 py-2 text-sm font-normal text-gray-900"
              >
                {Object.entries(DURACIONES).map(([clave, { etiqueta }]) => (
                  <option key={clave} value={clave}>
                    {etiqueta}
                  </option>
                ))}
              </select>
            </label>

            <fieldset>
              <legend className="mb-1.5 text-xs font-semibold text-esmeralda-900">Mis intereses</legend>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {categorias.map((categoria) => (
                  <label key={categoria.id} className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={intereses.includes(categoria.id)}
                      onChange={() => alternarInteres(categoria.id)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: estiloCategoria(categoria.slug).color }}
                    />
                    {categoria.nombre}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="sm:col-span-2">
              <Button type="submit" className="w-full bg-esmeralda-900 uppercase tracking-wide hover:bg-esmeralda-800 sm:w-auto">
                <Sparkles size={16} aria-hidden="true" />
                {items.length > 0 ? "Generar otro recorrido" : "Generar recorrido"}
              </Button>
            </div>
          </form>
        </section>

        {/* ---- Recorrido ---- */}
        <section aria-labelledby="titulo-recorrido" aria-live="polite">
          <h2 id="titulo-recorrido" className="text-sm font-extrabold uppercase tracking-wide text-esmeralda-900">
            Tu recorrido
          </h2>

          {items.length > 0 ? (
            <>
              <p className="mt-1 text-sm text-gray-600">
                {plan.totalParadas} {plan.totalParadas === 1 ? "parada" : "paradas"} · {plan.dias.length}{" "}
                {plan.dias.length === 1 ? "día" : "días"} · ≈ {formatoDuracion(plan.totalMin)} entre visitas y traslados
                {plan.totalKm > 0 && ` · unos ${plan.totalKm} km`}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Los tiempos y distancias son aproximados (traslados en línea recta, a velocidad de ciudad).
              </p>
              <div className="mt-4">
                <ItinerarioDias
                  plan={plan}
                  categoriaPorId={categoriaPorId}
                  editable
                  onMover={(indice, delta) => cambiarItems(moverItem(items, indice, delta))}
                  onQuitar={(indice) => cambiarItems(quitarItem(items, indice))}
                />
              </div>

              {/* Agregar otro lugar */}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <label className="flex-1">
                  <span className="sr-only">Agregar un lugar al recorrido</span>
                  <select
                    value={lugarAgregar}
                    onChange={(e) => setLugarAgregar(e.target.value)}
                    disabled={items.length >= MAX_PARADAS || disponibles.length === 0}
                    className="w-full rounded-full border border-esmeralda-200 bg-white px-4 py-2.5 text-sm text-gray-900"
                  >
                    <option value="">
                      {items.length >= MAX_PARADAS ? "Llegaste al máximo de paradas" : "Agregar otro lugar…"}
                    </option>
                    {disponibles.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nombre} · {estiloCategoria(categoriaPorId[l.categoria_id]?.slug).etiqueta}
                      </option>
                    ))}
                  </select>
                </label>
                <Button variante="secundario" onClick={agregar} disabled={!lugarAgregar}>
                  <Plus size={16} aria-hidden="true" />
                  Agregar
                </Button>
              </div>

              {/* Guardar */}
              <div className="mt-6 rounded-2xl bg-esmeralda-50 p-5 ring-1 ring-esmeralda-100">
                {haySesion ? (
                  <form onSubmit={guardar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium text-esmeralda-900">
                      Nombre del recorrido
                      <input
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        maxLength={80}
                        className="rounded-xl border border-esmeralda-200 bg-white px-4 py-2.5 text-sm font-normal text-gray-900"
                      />
                    </label>
                    <Button type="submit" disabled={estado.guardando}>
                      <Save size={16} aria-hidden="true" />
                      {estado.guardando ? "Guardando…" : "Guardar recorrido"}
                    </Button>
                  </form>
                ) : (
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-700">Inicia sesión para guardar tu recorrido y verlo cuando quieras.</p>
                    <Button href={`/login?next=${encodeURIComponent("/recorridos")}`}>Iniciar sesión</Button>
                  </div>
                )}

                {estado.error && (
                  <p role="alert" className="mt-3 text-sm text-red-600">
                    {estado.error}
                  </p>
                )}
                {guardado && (
                  <p role="status" className="mt-3 text-sm font-medium text-esmeralda-800">
                    ¡Recorrido guardado!{" "}
                    <Link href={`/recorridos/${guardado.id}`} className="underline">
                      Verlo
                    </Link>
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="mt-2 rounded-2xl bg-white p-4 text-sm text-gray-700 ring-1 ring-esmeralda-100">
              {sinResultados
                ? "Todavía no tenemos lugares con esos intereses. Prueba con otras categorías."
                : "Elige tu tiempo de estancia y tus intereses, y pulsa «Generar recorrido»."}
            </p>
          )}
        </section>
      </div>

      {/* ---- Mapa ---- */}
      <div className="h-[380px] lg:sticky lg:top-20 lg:h-[calc(100dvh-8rem)] lg:min-h-[480px] lg:max-h-[640px] lg:self-start">
        <Mapa
          lugares={lugares}
          categorias={categorias}
          ruta={items.map((i) => i.lugar)}
          className="h-full rounded-3xl ring-1 ring-esmeralda-200"
        />
      </div>
    </div>
  );
}
