import { Outlet, useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import PageViewTracker from "@/features/analytics/components/PageViewTracker";

const Layout = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg"
      >
        Saltar al contenido
      </a>
      <PageViewTracker />
      <TopBar />
      <Header />
      <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
        {/* Las páginas se cargan en diferido; mientras, se mantienen el encabezado y el pie. */}
        {/* El hueco ocupa toda la pantalla: el pie no aparece y luego salta (CLS). */}
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Layout;
