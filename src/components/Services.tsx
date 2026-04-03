import { CircleDollarSign, LayoutGrid, Users } from "lucide-react";

const services = [
  {
    icon: CircleDollarSign,
    iconBg: "bg-gold-light",
    iconColor: "text-gold",
    title: "Asesoría financiera",
    desc: "Gestión de créditos, planeación presupuestal y estrategias de inversión adaptadas al tamaño y sector de tu empresa.",
  },
  {
    icon: LayoutGrid,
    iconBg: "bg-ame-green-light",
    iconColor: "text-ame-green",
    title: "Gestión administrativa",
    desc: "Organización de procesos, gestión documental, cumplimiento normativo y fortalecimiento de la estructura organizacional.",
  },
  {
    icon: Users,
    iconBg: "bg-ame-blue-light",
    iconColor: "text-ame-blue",
    title: "Consultoría empresarial",
    desc: "Diagnóstico organizacional, planes de mejora continua y acompañamiento en procesos de formalización empresarial.",
  },
];

const Services = () => (
  <section id="services" className="py-14 px-8 bg-card">
    <div className="animate-fade-in-up">
      <p className="text-[11px] tracking-[2px] text-gold font-medium uppercase mb-2">Lo que ofrecemos</p>
      <h3 className="text-xl font-medium text-card-foreground mb-2">Servicios diseñados para tu negocio</h3>
      <p className="text-sm text-muted-foreground max-w-lg leading-relaxed mb-9">
        Combinamos experiencia financiera, gestión administrativa y asesoría estratégica para llevar tu empresa al siguiente nivel.
      </p>
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      {services.map((s, i) => (
        <div
          key={s.title}
          className={`border border-border rounded-lg p-6 bg-card hover:border-gold hover:-translate-y-0.5 transition-all cursor-pointer animate-fade-in-up-delay-${i + 1}`}
        >
          <div className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center mb-3.5`}>
            <s.icon className={`w-5 h-5 ${s.iconColor}`} />
          </div>
          <h4 className="text-sm font-medium text-card-foreground mb-2">{s.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Services;
