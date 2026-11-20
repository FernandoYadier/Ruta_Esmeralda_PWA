"use client";

import Link from "next/link";
import { useActionState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { registrarse } from "@/services/auth";

export default function RegistroForm() {
  const [estado, accion, pendiente] = useActionState(registrarse, null);

  if (estado?.exito) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-xl font-semibold text-esmeralda-900">¡Casi listo!</h1>
        <p role="status" className="text-sm text-gray-700">
          {estado.exito}
        </p>
        <Button href="/login" variante="secundario">
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-esmeralda-900">Crear cuenta</h1>

      <Input label="Nombre" name="nombre" autoComplete="name" required defaultValue={estado?.nombre ?? ""} />
      <Input
        label="Correo electrónico"
        name="correo"
        type="email"
        autoComplete="email"
        required
        defaultValue={estado?.correo ?? ""}
      />
      <Input
        label="Contraseña"
        name="contrasena"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <Input
        label="Confirmar contraseña"
        name="confirmar"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      {estado?.error && (
        <p role="alert" className="text-sm text-red-600">
          {estado.error}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-esmeralda-700 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
