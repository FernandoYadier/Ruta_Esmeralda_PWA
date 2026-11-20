"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { BUCKETS, eliminarImagen, subirImagen } from "@/lib/storage";

export default function PruebaFotos({ lugares }) {
  const [lugarId, setLugarId] = useState(lugares[0]?.id ?? "");
  const [archivo, setArchivo] = useState(null);
  const [estado, setEstado] = useState({ cargando: false, error: "", url: "" });

  async function subir(evento) {
    evento.preventDefault();
    if (!lugarId || !archivo) return;
    setEstado({ cargando: true, error: "", url: "" });

    let subida = null;
    try {
      subida = await subirImagen({ bucket: BUCKETS.lugares, carpeta: lugarId, archivo });

      const supabase = createClient();
      const { count } = await supabase
        .from("lugar_fotos")
        .select("id", { count: "exact", head: true })
        .eq("lugar_id", lugarId);

      const { error } = await supabase
        .from("lugar_fotos")
        .insert({ lugar_id: lugarId, url: subida.url, orden: count ?? 0 });
      if (error) throw new Error(`No se pudo registrar la foto: ${error.message}`);

      // Si el lugar aún no tiene portada, esta foto pasa a serlo.
      await supabase.from("lugares").update({ portada_url: subida.url }).eq("id", lugarId).is("portada_url", null);

      setEstado({ cargando: false, error: "", url: subida.url });
    } catch (error) {
      // Si la foto ya se subió pero no se pudo registrar, se borra para no dejar archivos sueltos.
      if (subida) await eliminarImagen({ bucket: BUCKETS.lugares, ruta: subida.ruta }).catch(() => {});
      setEstado({ cargando: false, error: error.message, url: "" });
    }
  }

  if (lugares.length === 0) {
    return <p className="mt-6 text-sm text-gray-600">Primero hay que cargar lugares (archivo 002).</p>;
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <form onSubmit={subir} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-esmeralda-900">
          Lugar
          <select
            value={lugarId}
            onChange={(e) => setLugarId(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-normal text-gray-900"
          >
            {lugares.map((lugar) => (
              <option key={lugar.id} value={lugar.id}>
                {lugar.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-esmeralda-900">
          Imagen (JPG, PNG o WebP, máx. 5 MB)
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            className="text-sm font-normal text-gray-700"
          />
        </label>

        <Button type="submit" disabled={estado.cargando || !archivo}>
          {estado.cargando ? "Subiendo…" : "Subir foto"}
        </Button>
      </form>

      {estado.error && (
        <p role="alert" className="text-sm text-red-600">
          {estado.error}
        </p>
      )}

      {estado.url && (
        <div role="status" className="flex flex-col gap-2">
          <p className="text-sm font-medium text-esmeralda-800">¡Listo! La foto se subió y se registró.</p>
          <Image
            src={estado.url}
            alt="Foto recién subida"
            width={480}
            height={320}
            className="h-auto w-full rounded-xl object-cover"
          />
        </div>
      )}
    </div>
  );
}
