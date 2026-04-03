import { CircleDollarSign, LayoutGrid, Users, ArrowRight } from "lucide-react";
import serviceFinancial from "@/assets/service-financial.jpg";
import serviceAdmin from "@/assets/service-admin.jpg";
import serviceConsulting from "@/assets/service-consulting.jpg";

const services = [
  {
    icon: CircleDollarSign,
    iconBg: "bg-gradient-to-br from-[#FAEEDA] to-[#F5D5A0]",
    iconColor: "text-gold",
    title: "Asesoría financiera",
    desc: "Gestión de créditos, planeación presupuestal y estrategias de inversión adaptadas al tamaño y sector de tu empresa.",
    image: serviceFinancial,
    accent: "group-hover:border-gold",
    tag: "Finanzas",
    tagColor: "bg-gold/15 text-gold",
  },
  {
    icon: LayoutGrid,
    iconBg: "bg-gradient-to-br from-[#EAF3DE] to-[#D4E8B8]",
    iconColor: "text-ame-green",
    title: "Gestión administrativa",
    desc: "Organización de procesos, gestión documental, cumplimiento normativo y fortalecimiento de la estructura organizacional.",
    image: serviceAdmin,
    accent: "group-hover:border-ame-green",
    tag: "Administración",
    tagColor: "bg-ame-green/15 text-ame-green",
  },
  {
    icon: Users,
    iconBg: "bg-gradient-to-br from-[#E6F1FB] to-[#C5DEFA]",
    iconColor: "text-ame-blue",
    title: "Consultoría empresarial",
    desc: "Diagnóstico organizacional, planes de mejora continua y acompañamiento en procesos de formalización empresarial.",
    image: serviceConsulting,
    accent: "group-hover:border-ame-blue",
    tag: "Consultoría",
    tagColor: "bg-ame-blue/15 text-ame-blue",
  },
];

const Services = () => (
  <section id="services" className="py-16 px-8 bg-gradient-to-b from-card to-secondary/50">
    <div className="text-center mb-12">
      <span className="inline-block bg-gold/10 text-gold text-[11px] tracking-[2px] font-semibold uppercase px-4 py-1.5 rounded-full mb-3">
        Lo que ofrecemos
      </span>
      <h3 className="text-2xl md:text-3xl font-semibold text-card-foreground mb-3">
        Servicios diseñados para tu negocio
      </h3>
      <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
        Combinamos experiencia financiera, gestión administrativa y asesoría estratégica para llevar tu empresa al siguiente nivel.
      </p>
    </div>
    <div className="grid md:grid-cols-3 gap-6">
      {services.map((s) => (
        <div
          key={s.title}
          className={`group border border-border rounded-2xl bg-card overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl ${s.accent}`}
        >
          <div className="relative h-48 overflow-hidden">
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              width={800}
              height={600}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-semibold ${s.tagColor} backdrop-blur-sm`}>
              {s.tag}
            </span>
          </div>
          <div className="p-6">
            <div className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center mb-4 shadow-sm`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <h4 className="text-base font-semibold text-card-foreground mb-2">{s.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
            <a href="#contact" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold group-hover:gap-2.5 transition-all">
              Más información <ArrowRight size={14} />
            </a>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Services;
