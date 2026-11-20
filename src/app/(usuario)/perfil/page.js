import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getSesion } from "@/services/sesion";
import { cerrarSesion } from "@/services/auth";

const ROLES = { usuario: "Usuario", establecimiento: "Establecimiento", admin: "Administrador" };

// Página provisional del perfil. El diseño final y la edición de datos vienen después.
export default async function PerfilPage() {
  const sesion = await getSesion(); // el proxy ya garantiza que hay sesión

  return (
    <section className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold text-esmeralda-900">Mi perfil</h1>

      <Card className="mt-6 space-y-2">
        <p className="text-lg font-semibold text-esmeralda-900">{sesion.nombre || "Sin nombre"}</p>
        <p className="text-sm text-gray-600">{sesion.correo}</p>
        <p className="text-sm text-gray-600">Rol: {ROLES[sesion.rol]}</p>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        {sesion.rol === "admin" && <Button href="/admin">Panel de administración</Button>}
        {sesion.rol === "establecimiento" && <Button href="/establecimiento">Mi negocio</Button>}
        <form action={cerrarSesion}>
          <Button type="submit" variante="secundario">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </section>
  );
}
