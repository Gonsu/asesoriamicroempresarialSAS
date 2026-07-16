import { CircleDollarSign, LayoutGrid, Users, ArrowRight } from "lucide-react";
import serviceFinancial from "@/assets/service-financial.jpg";
import serviceAdmin from "@/assets/service-admin.jpg";
import serviceConsulting from "@/assets/service-consulting.jpg";

const services = [
  {
    icon: CircleDollarSign,
    title: "Asesoría financiera",
    tag: "Finanzas",
    image: serviceFinancial,
    desc: "Gestión integral de créditos, planeación presupuestal y estrategias de inversión adaptadas al tamaño y sector de tu empresa.",
    points: [
      "Estructuración y gestión de microcréditos",
      "Planeación presupuestal y flujo de caja",
      "Estrategias de inversión y financiación",
      "Análisis de riesgo financiero",
    ],
  },
  {
    icon: LayoutGrid,
    title: "Gestión administrativa",
    tag: "Administración",
    image: serviceAdmin,
    desc: "Organización de procesos, gestión documental, cumplimiento normativo y fortalecimiento de la estructura organizacional.",
    points: [
      "Organización de procesos internos",
      "Gestión documental y archivo",
      "Cumplimiento normativo y legal",
      "Estructura organizacional",
    ],
  },
  {
    icon: Users,
    title: "Consultoría empresarial",
    tag: "Consultoría",
    image: serviceConsulting,
    desc: "Diagnóstico organizacional, planes de mejora continua y acompañamiento en procesos de formalización empresarial.",
    points: [
      "Diagnóstico organizacional",
      "Planes de mejora continua",
      "Formalización empresarial",
      "Capacitación de talento humano",
    ],
  },
];

const Servicios = () => (
  <>
    <section className="bg-ame-dark py-16 px-6 md:px-8 text-center">
      <span className="text-sm font-semibold text-primary">Nuestros servicios</span>
      <h1 className="text-4xl md:text-5xl font-semibold text-primary-foreground mt-3 mb-4">
        Soluciones para tu empresa
      </h1>
      <p className="text-primary-foreground/70 max-w-2xl mx-auto text-base">
        Combinamos experiencia financiera, gestión administrativa y consultoría estratégica.
      </p>
    </section>

    <section className="section-padding px-6 md:px-8 bg-background">
      <div className="max-w-5xl mx-auto space-y-16">
        {services.map((s, idx) => (
          <div
            key={s.title}
            className={`grid md:grid-cols-2 gap-10 items-center ${idx % 2 === 1 ? "md:[direction:rtl]" : ""}`}
          >
            <div className="rounded-xl overflow-hidden h-64 md:h-80 shadow-lg [direction:ltr]">
              <img src={s.image} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="[direction:ltr]">
              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {s.tag}
              </span>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">{s.title}</h2>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed mb-5">{s.desc}</p>
              <ul className="space-y-2 mb-6">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/573168308779"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Solicitar información <ArrowRight size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  </>
);

export default Servicios;
