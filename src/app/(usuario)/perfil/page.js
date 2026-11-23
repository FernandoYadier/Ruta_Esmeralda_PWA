import AccesosSesion from "@/components/perfil/AccesosSesion";
import FormularioContrasena from "@/components/perfil/FormularioContrasena";
import FormularioDatos from "@/components/perfil/FormularioDatos";
import FotoPerfil from "@/components/perfil/FotoPerfil";
import InteresesPerfil from "@/components/perfil/InteresesPerfil";
import MisResenas from "@/components/perfil/MisResenas";
import Card from "@/components/ui/Card";
import { getCategorias } from "@/services/categorias";
import { getInteresesIds, getMisResenas } from "@/services/perfil";
import { getSesion } from "@/services/sesion";

export default async function PerfilPage() {
  const sesion = await getSesion(); // el proxy ya garantiza que hay sesión
  const [categorias, interesesIds, resenas] = await Promise.all([
    getCategorias(),
    getInteresesIds(),
    getMisResenas(),
  ]);

  return (
    <section className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold text-esmeralda-900">Mi perfil</h1>

      <Card className="mt-6">
        <FotoPerfil
          usuarioId={sesion.id}
          nombre={sesion.nombre}
          correo={sesion.correo}
          avatarUrl={sesion.avatarUrl}
        />
      </Card>

      <Card className="mt-6">
        <FormularioDatos
          correo={sesion.correo}
          rol={sesion.rol}
          nombre={sesion.nombre}
          tipoEstancia={sesion.tipoEstancia}
        />
      </Card>

      <Card className="mt-6">
        <InteresesPerfil
          usuarioId={sesion.id}
          categorias={categorias}
          interesesIniciales={interesesIds}
        />
      </Card>

      <Card className="mt-6">
        <MisResenas resenas={resenas} />
      </Card>

      <Card className="mt-6">
        <FormularioContrasena />
      </Card>

      <Card className="mt-6">
        <AccesosSesion rol={sesion.rol} />
      </Card>
    </section>
  );
}