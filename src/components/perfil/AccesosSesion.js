import Button from "@/components/ui/Button";
import { cerrarSesion } from "@/services/auth";

// Accesos según el rol y botón para cerrar sesión.
// Una persona con rol "usuario" solo ve "Cerrar sesión".
export default function AccesosSesion({ rol }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-esmeralda-900">Accesos y sesión</h2>

      <div className="flex flex-wrap gap-3">
        {rol === "admin" && <Button href="/admin">Panel de administración</Button>}
        {rol === "establecimiento" && <Button href="/establecimiento">Mi negocio</Button>}
        <form action={cerrarSesion}>
          <Button type="submit" variante="secundario">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}