// Subida y borrado de imágenes con Supabase Storage.
// Se usa SOLO desde Client Components: la foto viaja directo del navegador a Storage
// (una Server Action tiene un límite de ~1 MB y no alcanzaría para una foto).
// Los permisos los decide la base de datos (políticas de storage.objects).
import { createClient } from "@/lib/supabase/client";

export const BUCKETS = { lugares: "lugares", resenas: "resenas", avatares: "avatares" };

const EXTENSIONES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_MB = { lugares: 5, resenas: 5, avatares: 2 };

// Devuelve un texto de error si el archivo no sirve, o null si está bien.
export function validarImagen(archivo, bucket = BUCKETS.lugares) {
  if (!archivo) return "Elige una imagen.";
  if (!EXTENSIONES[archivo.type]) return "Solo se aceptan imágenes JPG, PNG o WebP.";
  const limite = MAX_MB[bucket] ?? 5;
  if (archivo.size > limite * 1024 * 1024) return `La imagen no debe pesar más de ${limite} MB.`;
  return null;
}

// Sube una imagen y devuelve su ruta y su URL pública.
//   bucket: "lugares" | "resenas" | "avatares"
//   carpeta: para "lugares" el id del lugar; para "resenas" y "avatares" el id del usuario.
export async function subirImagen({ bucket, carpeta, archivo }) {
  const problema = validarImagen(archivo, bucket);
  if (problema) throw new Error(problema);

  const supabase = createClient();
  const ruta = `${carpeta}/${crypto.randomUUID()}.${EXTENSIONES[archivo.type]}`;

  const { error } = await supabase.storage.from(bucket).upload(ruta, archivo, {
    contentType: archivo.type,
    cacheControl: "31536000", // el nombre es único, así que se puede guardar en caché un año
  });
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(ruta);
  return { ruta, url: data.publicUrl };
}

// Borra varias imágenes de un bucket en una sola petición (las rutas que devuelve subirImagen).
export async function eliminarImagenes({ bucket, rutas }) {
  if (rutas.length === 0) return;
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove(rutas);
  if (error) throw new Error(`No se pudo borrar la imagen: ${error.message}`);
}

// Borra una imagen por su ruta.
export async function eliminarImagen({ bucket, ruta }) {
  return eliminarImagenes({ bucket, rutas: [ruta] });
}

// Obtiene la ruta a partir de una URL pública guardada en la base de datos.
export function rutaDesdeUrl(url, bucket) {
  const marca = `/storage/v1/object/public/${bucket}/`;
  const posicion = url.indexOf(marca);
  return posicion === -1 ? null : decodeURIComponent(url.slice(posicion + marca.length));
}
