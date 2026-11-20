// Solo permite redirigir a rutas internas del sitio (evita enlaces como "//sitio-malicioso.com").
export function rutaSegura(ruta, porDefecto = "/") {
  if (typeof ruta === "string" && ruta.startsWith("/") && !ruta.startsWith("//") && !ruta.includes("\\")) {
    return ruta;
  }
  return porDefecto;
}
