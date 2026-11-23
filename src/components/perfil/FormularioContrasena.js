"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cambiarContrasena } from "@/services/perfil";

// Formulario para cambiar la contraseña. Los campos se vacían solos después de enviar.
export default function FormularioContrasena() {
  const [estado, accion, pendiente] = useActionState(cambiarContrasena, null);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-esmeralda-900">Cambiar contraseña</h2>

      <Input
        label="Contraseña nueva"
        name="contrasena_nueva"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        aria-describedby="ayuda-contrasena"
      />
      <p id="ayuda-contrasena" className="-mt-2 text-xs text-gray-500">
        Mínimo 8 caracteres.
      </p>

      <Input
        label="Confirmar contraseña nueva"
        name="contrasena_confirmar"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

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
        {pendiente ? "Cambiando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}