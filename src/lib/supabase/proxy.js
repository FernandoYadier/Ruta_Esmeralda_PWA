import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Rutas que exigen haber iniciado sesión.
const RUTAS_PRIVADAS = ["/perfil", "/favoritos"];
// Rutas de paneles: además de sesión, exigen un rol.
const ROLES_POR_PANEL = {
  "/admin": ["admin"],
  "/establecimiento": ["establecimiento", "admin"],
};

const empiezaCon = (pathname, base) => pathname === base || pathname.startsWith(`${base}/`);

// Se ejecuta en cada petición (desde src/proxy.js):
// 1) renueva la sesión si el token venció y guarda las cookies nuevas,
// 2) protege las rutas privadas y los paneles según el rol.
export async function updateSession(request) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
        },
      },
    },
  );

  // getClaims() verifica la firma del token; no usar getSession() en código de servidor.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;
  const { pathname } = request.nextUrl;

  // Al redirigir hay que conservar las cookies renovadas.
  const redirigir = (destino) => {
    const url = request.nextUrl.clone();
    url.pathname = destino.pathname;
    url.search = destino.search ?? "";
    const redireccion = NextResponse.redirect(url);
    respuesta.cookies.getAll().forEach((cookie) => redireccion.cookies.set(cookie));
    return redireccion;
  };

  const panel = Object.keys(ROLES_POR_PANEL).find((base) => empiezaCon(pathname, base));
  const esPrivada = panel || RUTAS_PRIVADAS.some((base) => empiezaCon(pathname, base));

  if (!claims && esPrivada) {
    return redirigir({ pathname: "/login", search: `?next=${encodeURIComponent(pathname)}` });
  }

  if (claims && panel) {
    const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", claims.sub).maybeSingle();
    if (!ROLES_POR_PANEL[panel].includes(perfil?.rol)) {
      return redirigir({ pathname: "/" });
    }
  }

  // Quien ya inició sesión no necesita ver el login ni el registro.
  if (claims && (pathname === "/login" || pathname === "/registro")) {
    return redirigir({ pathname: "/" });
  }

  return respuesta;
}
