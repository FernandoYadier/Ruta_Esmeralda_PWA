"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { BUCKETS, eliminarImagenes, rutaDesdeUrl, subirImagen, validarImagen } from "@/lib/storage";

// Foto de perfil: elige una imagen, la valida, la sube a Storage, guarda su URL
// y borra la foto anterior. No se usa "upsert": siempre se sube un archivo nuevo.
export default function FotoPerfil({ usuarioId, nombre, correo, avatarUrl }) {
  const router = useRouter();
  const entrada = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const inicial = (nombre || correo || "?").charAt(0).toUpperCase();

  async function elegirFoto(evento) {
    const archivo = evento.target.files?.[0];
    evento.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;

    setError("");
    setExito("");

    // 1. Validar antes de subir nada (tipo y peso).
    const problema = validarImagen(archivo, BUCKETS.avatares);
    if (problema) {
      setError(problema);
      return;
    }

    setSubiendo(true);
    let nueva = null;
    try {
      // 2. Subir la foto nueva a la carpeta propia.
      nueva = await subirImagen({ bucket: BUCKETS.avatares, carpeta: usuarioId, archivo });

      // 3. Guardar la URL en el perfil.
      const supabase = createClient();
      const { error: errorGuardado } = await supabase
        .from("perfiles")
        .update({ avatar_url: nueva.url })
        .eq("id", usuarioId);
      if (errorGuardado) throw new Error(errorGuardado.message);
    } catch {
      // Si la foto llegó a subirse pero no se pudo guardar, la quitamos para no dejar archivos sueltos.
      if (nueva) await eliminarImagenes({ bucket: BUCKETS.avatares, rutas: [nueva.ruta] }).catch(() => {});
      setError("No pudimos actualizar tu foto. Inténtalo de nuevo.");
      setSubiendo(false);
      return;
    }

    // 4. Borrar la foto anterior (si falla, no pasa nada: la nueva ya quedó guardada).
    const rutaAnterior = avatarUrl ? rutaDesdeUrl(avatarUrl, BUCKETS.avatares) : null;
    if (rutaAnterior) {
      await eliminarImagenes({ bucket: BUCKETS.avatares, rutas: [rutaAnterior] }).catch(() => {});
    }

    setExito("Tu foto se actualizó.");
    setSubiendo(false);
    router.refresh(); // vuelve a pedir los datos: la foto nueva aparece aquí y en el Header
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-esmeralda-900">Foto de perfil</h2>

      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`Foto de perfil de ${nombre || "tu cuenta"}`}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover ring-2 ring-esmeralda-100"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-24 w-24 items-center justify-center rounded-full bg-esmeralda-700 text-4xl font-semibold text-white"
          >
            {inicial}
          </span>
        )}

        <div className="flex flex-col items-start gap-2">
          <input
            ref={entrada}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={elegirFoto}
            aria-label="Elegir foto de perfil"
            className="hidden"
          />
          <Button variante="secundario" onClick={() => entrada.current?.click()} disabled={subiendo}>
            <Camera size={16} aria-hidden="true" />
            {subiendo ? "Subiendo…" : avatarUrl ? "Cambiar foto" : "Subir foto"}
          </Button>
          <p className="text-xs text-gray-500">JPG, PNG o WebP, de máximo 2 MB.</p>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {exito && (
        <p role="status" className="rounded-xl bg-esmeralda-50 px-4 py-3 text-sm text-esmeralda-800">
          {exito}
        </p>
      )}
    </div>
  );
}