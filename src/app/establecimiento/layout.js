import PanelLayout from "@/components/layout/PanelLayout";

const items = [
  { href: "/establecimiento", etiqueta: "Resumen", exacto: true },
  { href: "/establecimiento/informacion", etiqueta: "Información" },
  { href: "/establecimiento/promociones", etiqueta: "Promociones" },
];

export default function EstablecimientoLayout({ children }) {
  return (
    <PanelLayout titulo="Panel de establecimientos" items={items}>
      {children}
    </PanelLayout>
  );
}
