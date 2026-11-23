"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { actualizarPerfil } from "@/services/perfil";

const ROLES = { usuario: "Usuario", establecimiento: "Establecimiento", admin: "Administrador" };

const OPCIONES_ESTANCIA = [
  { valor: "turista", etiqueta: "Turista (estoy de visita)" },
  { valor: "nuevo_habitante", etiqueta: "Nuevo habitante (vivo aquí desde hace poco)" },
];

export default function FormularioDatos({ correo, rol, nombre, tipoEstancia }) {
  const [estado, accion, pendiente] = useActionState(actualizarPerfil, null);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-esmeralda-900">Datos personales</h2>
        <span className="rounded-full bg-esmeralda-100 px-3 py-1 text-xs font-semibold text-esmeralda-800">
          {ROLES[rol] ?? "Usuario"}
        </span>
      </div>

      <Input
        label="Correo electrónico"
        name="correo"
        type="email"
        value={correo}
        readOnly
        aria-describedby="ayuda-correo"
      />
      <p id="ayuda-correo" className="-mt-2 text-xs text-gray-500">
        El correo no se puede cambiar.
      </p>

      <Input
        label="Nombre"
        name="nombre"
        type="text"
        autoComplete="name"
        maxLength={60}
        required
        defaultValue={estado?.nombre ?? nombre}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tipo_estancia" className="text-sm font-medium text-esmeralda-900">
          Tipo de estancia
        </label>
        <select
          id="tipo_estancia"
          name="tipo_estancia"
          defaultValue={estado?.tipoEstancia ?? tipoEstancia ?? ""}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-2 focus:outline-offset-1 focus:outline-esmeralda-600"
        >
          {/* "Sin definir" solo aparece mientras la persona no haya elegido. */}
          {!tipoEstancia && <option value="">Sin definir</option>}
          {OPCIONES_ESTANCIA.map(({ valor, etiqueta }) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </div>

      {estado?.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {estado.error}
        </p>
      )}
      {estado?.exito && (
        <p role="status" className="rounded-xl bg-esmeralda-50 px-4 py-3 text-sm text-esmeralda-800">
          {estado.exito}
        </p>
      )}

      <Button type="submit" disabled={pendiente} className="self-start">
        {pendiente ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}