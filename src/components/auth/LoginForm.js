"use client";

import Link from "next/link";
import { useActionState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { iniciarSesion } from "@/services/auth";

export default function LoginForm({ siguiente = "", aviso = "" }) {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, null);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-esmeralda-900">Iniciar sesión</h1>

      {aviso && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {aviso}
        </p>
      )}

      <input type="hidden" name="siguiente" value={siguiente} />
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
        autoComplete="current-password"
        required
      />

      {estado?.error && (
        <p role="alert" className="text-sm text-red-600">
          {estado.error}
        </p>
      )}

      <Button type="submit" disabled={pendiente}>
        {pendiente ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-esmeralda-700 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  );
}
