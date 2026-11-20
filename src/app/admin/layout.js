import PanelLayout from "@/components/layout/PanelLayout";

const items = [
  { href: "/admin", etiqueta: "Resumen", exacto: true },
  { href: "/admin/usuarios", etiqueta: "Usuarios" },
  { href: "/admin/contenido", etiqueta: "Contenido" },
  { href: "/admin/reportes", etiqueta: "Reportes" },
];

export default function AdminLayout({ children }) {
  return (
    <PanelLayout titulo="Administración" items={items}>
      {children}
    </PanelLayout>
  );
}
