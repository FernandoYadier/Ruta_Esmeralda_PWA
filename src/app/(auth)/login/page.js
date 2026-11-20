import LoginForm from "@/components/auth/LoginForm";
import { rutaSegura } from "@/lib/rutas";

export const metadata = { title: "Iniciar sesión · Ruta Esmeralda" };

export default async function LoginPage({ searchParams }) {
  const { next, error } = await searchParams;

  return (
    <LoginForm
      siguiente={rutaSegura(next)}
      aviso={error === "confirmacion" ? "El enlace de confirmación no es válido o ya venció. Intenta iniciar sesión o regístrate otra vez." : ""}
    />
  );
}
