import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Home } from "lucide-react";
import Seo from "@/components/Seo";
import { notFoundMeta } from "@/config/routes";

const suggestions = [
  { to: "/servicios", label: "Nuestros servicios", text: "Asesoría financiera, gestión administrativa y consultoría." },
  { to: "/empresa", label: "Quiénes somos", text: "Misión, visión, valores y comité asesor." },
  { to: "/contacto", label: "Contacto", text: "Escríbenos o visítanos en Cúcuta." },
];

/** 404 dentro del Layout (encabezado y pie), con la cabecera oscura de las demás páginas. */
const NotFound = () => {
  const { pathname } = useLocation();
  return (
    <>
      <Seo path={pathname} title={notFoundMeta.title} description={notFoundMeta.description} noindex />
      <section className="bg-ame-dark py-16 px-6 md:px-8 text-center">
        <span className="text-sm font-semibold text-[#5DCAA5]">Error 404</span>
        <h1 className="text-4xl md:text-5xl font-semibold text-primary-foreground mt-3 mb-4">Página no encontrada</h1>
        <p className="text-primary-foreground/75 max-w-2xl mx-auto text-base">
          La dirección <code className="text-primary-foreground/90 break-all">{pathname}</code> no existe o cambió de
          lugar.
        </p>
      </section>
      <section className="section-padding px-6 md:px-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Home size={16} aria-hidden="true" /> Volver al inicio
            </Link>
          </div>
          <h2 className="text-lg font-semibold text-foreground text-center mb-6">También puede interesarte</h2>
          <ul className="grid md:grid-cols-3 gap-4">
            {suggestions.map((s) => (
              <li key={s.to}>
                <Link
                  to={s.to}
                  className="block h-full bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <span className="flex items-center justify-between font-semibold text-foreground mb-1">
                    {s.label}
                    <ArrowRight size={16} aria-hidden="true" className="text-primary group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-sm text-muted-foreground">{s.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default NotFound;
