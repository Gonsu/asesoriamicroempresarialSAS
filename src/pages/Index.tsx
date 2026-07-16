import { Link } from "react-router-dom";
import { ArrowRight, CircleDollarSign, LayoutGrid, Users } from "lucide-react";
import HeroSimple from "@/components/HeroSimple";
import StatsBand from "@/components/StatsBand";
import CTA from "@/components/CTA";
import aboutCucuta from "@/assets/cucuta-real.png";

const featured = [
  {
    icon: CircleDollarSign,
    title: "Asesoría financiera",
    desc: "Gestión de créditos, presupuesto y estrategias de inversión.",
  },
  {
    icon: LayoutGrid,
    title: "Gestión administrativa",
    desc: "Procesos, gestión documental y cumplimiento normativo.",
  },
  {
    icon: Users,
    title: "Consultoría empresarial",
    desc: "Diagnóstico organizacional y planes de mejora continua.",
  },
];

const Index = () => (
  <>
    <HeroSimple />
    <StatsBand />

    {/* Resumen empresa */}
    <section className="section-padding px-6 md:px-8 bg-card">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="rounded-xl overflow-hidden h-72 md:h-80 shadow-lg">
          <img src={aboutCucuta} alt="Cúcuta, Norte de Santander" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div>
          <span className="text-sm font-semibold text-primary">Quiénes somos</span>
          <h2 className="text-3xl font-semibold text-card-foreground mt-2 mb-4">
            Asesoría Microempresarial S.A.S.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            Somos una sociedad comercial de economía privada, constituida conforme a las leyes de Colombia, dedicada a impulsar el crecimiento de la microempresa en Norte de Santander.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            Nuestro equipo está conformado por profesionales con amplia trayectoria en el sector financiero y empresarial.
          </p>
          <Link
            to="/empresa"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            Conoce más sobre nosotros <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>

    {/* Servicios destacados */}
    <section className="section-padding px-6 md:px-8 bg-secondary/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary">Lo que ofrecemos</span>
          <h2 className="text-3xl font-semibold text-foreground mt-2 mb-3">
            Servicios diseñados para tu negocio
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Soluciones financieras, administrativas y de consultoría para cada etapa de tu empresa.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {featured.map((s) => (
            <div key={s.title} className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            to="/servicios"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Ver todos los servicios <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>

    <CTA />
  </>
);

export default Index;
