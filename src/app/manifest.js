// Next.js publica este objeto como /manifest.webmanifest.
// Es lo que permite instalar Ruta Esmeralda como app en el celular o la computadora.
export default function manifest() {
  return {
    name: "Ruta Esmeralda",
    short_name: "Ruta Esmeralda",
    description: "Descubre Villahermosa y Tabasco con recorridos personalizados.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "es",
    background_color: "#eefaf3",
    theme_color: "#1a4835",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
