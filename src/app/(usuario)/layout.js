import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

export default function UsuarioLayout({ children }) {
  return (
    <>
      <Header />
      {/* pb-20 deja espacio para la barra inferior en celular y tableta */}
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}
