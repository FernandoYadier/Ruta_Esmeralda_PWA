"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Enlace que sabe si es la página actual. "exacto" evita que "/" o "/admin"
// se marquen como activos en todas sus subrutas.
export default function NavLink({
  href,
  exacto = false,
  className = "",
  activoClassName = "",
  inactivoClassName = "",
  children,
  ...props
}) {
  const pathname = usePathname();
  const activo = exacto ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`${className} ${activo ? activoClassName : inactivoClassName}`}
      {...props}
    >
      {children}
    </Link>
  );
}
