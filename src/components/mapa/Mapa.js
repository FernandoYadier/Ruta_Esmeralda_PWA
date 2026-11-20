"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { estiloCategoria } from "@/lib/categorias-estilo";

// Centro de Villahermosa, Tabasco.
const CENTRO = [17.9892, -92.9475];

// Mapa base: OpenStreetMap. Su servidor público es gratuito para uso ligero (desarrollo, demos);
// si la app llega a tener mucho tráfico, hay que cambiar a un proveedor con llave (p. ej. MapTiler)
// y solo se edita este bloque.
const CAPA = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  atribucion: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// Pin en forma de gota con el color de la categoría (y el número de parada si es parte de un recorrido).
function crearPin(L, color, numero, atenuado) {
  const contenido = numero
    ? `<span style="transform:rotate(45deg);color:#fff;font:700 12px/1 system-ui,sans-serif">${Number(numero)}</span>`
    : `<span style="width:8px;height:8px;border-radius:9999px;background:#fff"></span>`;
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 34],
    popupAnchor: [0, -32],
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;opacity:${atenuado ? 0.4 : 1}">${contenido}</div>`,
  });
}

// El contenido del globo se arma con nodos del DOM (textContent) para que un nombre
// con caracteres especiales nunca se interprete como HTML.
function crearGlobo(lugar, estilo, numero) {
  const caja = document.createElement("div");
  caja.style.minWidth = "140px";

  const categoria = document.createElement("div");
  categoria.textContent = numero ? `Parada ${numero} · ${lugar.categoria ?? ""}` : (lugar.categoria ?? "");
  categoria.style.cssText = `font:600 11px system-ui,sans-serif;text-transform:uppercase;letter-spacing:.04em;color:${estilo.color}`;

  const titulo = document.createElement("div");
  titulo.textContent = lugar.nombre;
  titulo.style.cssText = "font:700 14px system-ui,sans-serif;margin:2px 0 6px;color:#1a4835";

  const enlace = document.createElement("a");
  enlace.href = `/lugar/${encodeURIComponent(lugar.slug)}`;
  enlace.textContent = "Ver detalle";
  enlace.style.cssText = "font:600 13px system-ui,sans-serif;color:#176b4d";

  caja.append(categoria, titulo, enlace);
  return caja;
}

// Props:
//   lugares     → lugares a mostrar como pines
//   categorias  → [{ id, slug, nombre }] para colorear los pines y armar la leyenda
//   ruta        → lugares de un recorrido, en orden (se dibuja la línea y se numeran las paradas)
//   zoomConRueda→ permitir zoom con la rueda del mouse (útil solo en el mapa de pantalla completa)
export default function Mapa({
  lugares = [],
  categorias = [],
  ruta = [],
  className = "",
  zoomConRueda = false,
  leyenda = true,
}) {
  const contenedor = useRef(null);
  const instancia = useRef(null);
  const [listo, setListo] = useState(false);

  // Crea el mapa una sola vez. Leaflet necesita "window", por eso se importa aquí y no arriba.
  useEffect(() => {
    let cancelado = false;
    let observador;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelado || !contenedor.current) return;

      const mapa = L.map(contenedor.current, { scrollWheelZoom: zoomConRueda, zoomControl: false }).setView(CENTRO, 12);
      L.control.zoom({ position: "bottomright" }).addTo(mapa);
      L.tileLayer(CAPA.url, {
        attribution: CAPA.atribucion,
        maxZoom: 19,
        referrerPolicy: "strict-origin-when-cross-origin", // OSM exige que se envíe el origen del sitio
      }).addTo(mapa);
      const capa = L.layerGroup().addTo(mapa);

      instancia.current = { L, mapa, capa };
      observador = new ResizeObserver(() => mapa.invalidateSize());
      observador.observe(contenedor.current);
      setListo(true);
    })();

    return () => {
      cancelado = true;
      observador?.disconnect();
      instancia.current?.mapa.remove();
      instancia.current = null;
    };
  }, [zoomConRueda]);

  // Dibuja pines y ruta cada vez que cambian los datos.
  useEffect(() => {
    const contexto = instancia.current;
    if (!listo || !contexto) return;
    const { L, mapa, capa } = contexto;

    capa.clearLayers();
    const categoriaPorId = Object.fromEntries(categorias.map((c) => [c.id, c]));
    const numeroPorId = new Map(ruta.map((lugar, indice) => [lugar.id, indice + 1]));
    const hayRuta = ruta.length > 0;
    const puntos = [];

    for (const lugar of lugares) {
      if (!Number.isFinite(lugar.latitud) || !Number.isFinite(lugar.longitud)) continue;
      const estilo = estiloCategoria(categoriaPorId[lugar.categoria_id]?.slug);
      const numero = numeroPorId.get(lugar.id);

      L.marker([lugar.latitud, lugar.longitud], {
        icon: crearPin(L, estilo.color, numero, hayRuta && !numero),
        title: lugar.nombre,
        zIndexOffset: numero ? 1000 : 0,
      })
        .bindPopup(crearGlobo(lugar, estilo, numero))
        .addTo(capa);

      if (!hayRuta || numero) puntos.push([lugar.latitud, lugar.longitud]);
    }

    if (hayRuta) {
      const camino = ruta
        .filter((l) => Number.isFinite(l.latitud) && Number.isFinite(l.longitud))
        .map((l) => [l.latitud, l.longitud]);
      L.polyline(camino, { color: "#1a4835", weight: 4, opacity: 0.85, dashArray: "8 8" }).addTo(capa);
    }

    if (puntos.length > 1) mapa.fitBounds(puntos, { padding: [40, 40], maxZoom: 15 });
    else if (puntos.length === 1) mapa.setView(puntos[0], 15);
    else mapa.setView(CENTRO, 12);
  }, [listo, lugares, categorias, ruta]);

  const enLeyenda = categorias.filter((c) => lugares.some((l) => l.categoria_id === c.id));

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={contenedor} className="h-full w-full" />
      {leyenda && enLeyenda.length > 0 && (
        <ul className="absolute right-3 top-3 z-[500] flex max-w-[calc(100%-1.5rem)] flex-wrap gap-x-3 gap-y-1 rounded-2xl bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-700 shadow">
          {enLeyenda.map((categoria) => (
            <li key={categoria.id} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: estiloCategoria(categoria.slug).color }}
              />
              {categoria.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
