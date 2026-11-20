import Link from "next/link";
import Logo from "@/components/layout/Logo";

export default function AuthLayout({ children }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-esmeralda-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/" aria-label="Ruta Esmeralda, ir al inicio">
            <Logo />
          </Link>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-esmeralda-100">{children}</div>
      </div>
    </main>
  );
}
