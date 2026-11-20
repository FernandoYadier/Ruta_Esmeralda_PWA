// Los datos de contacto los escriben los dueños de los negocios: antes de usarlos en un enlace se validan.

// Devuelve la dirección web solo si es http o https (descarta "javascript:" y similares).
export function urlSegura(valor) {
  if (!valor) return null;
  try {
    const texto = /^https?:\/\//i.test(valor.trim()) ? valor.trim() : `https://${valor.trim()}`;
    const url = new URL(texto);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// "993 123 4567" → "tel:9931234567". Devuelve null si no parece un teléfono.
export function telefonoHref(valor) {
  if (!valor) return null;
  const limpio = valor.replace(/[^\d+]/g, "");
  return limpio.replace(/\D/g, "").length >= 7 ? `tel:${limpio}` : null;
}

// Indicaciones en Google Maps desde donde esté la persona hasta el lugar.
export function rutaGoogleMaps(latitud, longitud) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}`;
}
