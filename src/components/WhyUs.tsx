import { useScrollReveal } from "@/hooks/useScrollReveal";

const pillars = [
  {
    letter: "M",
    title: "Misión",
    desc: "Impulsar y fortalecer el desarrollo de la pequeña empresa para incrementar su capacidad de productividad y generación de empleo a través del servicio de Microcrédito que incluye la asesoría y capacitación del Talento Humano, con la participación de Recursos del Estado, los Accionistas, el Sector Financiero y Terceros legalmente definidos, fomentando el crecimiento económico y social en el departamento de Norte de Santander.",
    dotClass: "bg-gradient-to-br from-[#D4F0E0] to-[#A8DFC0] text-[#1B6B3A] shadow-sm",
  },
  {
    letter: "V",
    title: "Visión",
    desc: "Ser reconocido como el mejor operador de Microcrédito con estabilidad financiera, que a través de opciones de crédito diferenciales, apoyado en la capacitación y asesoría profesional, permitan la obtención de los mejores beneficios para los clientes y accionistas.",
    dotClass: "bg-gradient-to-br from-[#EAF3DE] to-[#D4E8B8] text-[#3B6D11] shadow-sm",
  },
  {
    letter: "O",
    title: "Objetivo Estratégico",
    desc: "Orientar la Gestión de la Sociedad en la creación de valor que permita: la satisfacción del cliente, el correcto desarrollo de los procesos internos, el adecuado manejo del clima organizacional, respondiendo igualmente a las expectativas de los Accionistas.",
    dotClass: "bg-gradient-to-br from-[#E6F1FB] to-[#C5DEFA] text-[#185FA5] shadow-sm",
  },
];

const values = [
  { name: "Servicio", desc: "Conocer y satisfacer las necesidades del cliente y expectativas del accionista.", pct: 98, fillClass: "bg-gradient-to-r from-[#5DCAA5] to-[#1B6B3A]" },
  { name: "Respeto", desc: "Por el cliente interno y externo basados en amabilidad, confianza y transparencia.", pct: 95, fillClass: "bg-gradient-to-r from-[#5DCAA5] to-[#1B6B3A]" },
  { name: "Trabajo en equipo", desc: "Integrar el trabajo hacia el logro de la Visión Global con responsabilidad.", pct: 97, fillClass: "bg-gradient-to-r from-[#85B7EB] to-[#378ADD]" },
  { name: "Mejora continua", desc: "Capacitación y asesoría del recurso humano de forma constante.", pct: 90, fillClass: "bg-gradient-to-r from-[#5DCAA5] to-[#2A8C5A]" },
  { name: "Compromiso", desc: "Dirigir recursos hacia actividades productivas con honestidad e integridad.", pct: 96, fillClass: "bg-gradient-to-r from-[#5DCAA5] to-[#1B6B3A]" },
];

const WhyUs = () => {
  const ref = useScrollReveal();
  return (
    <section id="empresa" ref={ref} className="bg-gradient-to-br from-secondary via-secondary to-[hsl(150,50%,95%)] py-16 px-8">
      <div className="text-center mb-10">
        <span className="inline-block bg-primary/10 text-primary text-[11px] tracking-[2px] font-semibold uppercase px-4 py-1.5 rounded-full mb-3">
          ¿Por qué elegirnos?
        </span>
        <h3 className="text-2xl md:text-3xl font-semibold text-foreground">
          Una empresa con propósito y valores sólidos
        </h3>
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
            Fundada bajo los principios de servicio, respeto y compromiso, Asesoría Microempresarial S.A.S. trabaja para ser el aliado estratégico de la microempresa colombiana, impulsando el crecimiento económico y social en Norte de Santander.
          </p>
          <div className="flex flex-col gap-4">
            {pillars.map((p) => (
              <div key={p.letter} className="flex gap-4 items-start bg-card p-4 rounded-xl border border-border hover:border-primary/30 transition-colors shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${p.dotClass}`}>
                  {p.letter}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">{p.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-ame-dark to-ame-mid rounded-2xl p-7 shadow-xl">
          <h3 className="text-lg font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#5DCAA5] to-[#1B6B3A]">
            Principios y Valores
          </h3>
          {values.map((v) => (
            <div key={v.name} className="py-3 border-b border-primary-foreground/10 last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="text-xs text-primary-foreground/80 min-w-[130px] font-medium">{v.name}</span>
                <div className="flex-1 h-2 bg-primary-foreground/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${v.fillClass} transition-all duration-1000`} style={{ width: `${v.pct}%` }} />
                </div>
                <span className="text-[11px] text-primary-foreground/50 min-w-[32px] text-right font-semibold">{v.pct}%</span>
              </div>
              <p className="text-[10px] text-primary-foreground/40 mt-1 ml-[142px]">{v.desc}</p>
            </div>
          ))}
          <div className="mt-6 pt-4 border-t border-primary-foreground/10">
            <p className="text-[11px] text-primary-foreground/40 text-center">
              Sociedad constituida conforme a las leyes de la República de Colombia · Reg. 2016
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
