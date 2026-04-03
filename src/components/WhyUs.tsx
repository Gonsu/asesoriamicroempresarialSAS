const pillars = [
  { letter: "M", title: "Misión", desc: "Brindar soluciones financieras y administrativas que fortalezcan la competitividad de nuestros clientes.", dotClass: "bg-gradient-to-br from-[#FAEEDA] to-[#F5D5A0] text-[#854F0B] shadow-sm" },
  { letter: "V", title: "Visión", desc: "Ser la empresa líder en asesoría microempresarial en el nororiente colombiano para 2030.", dotClass: "bg-gradient-to-br from-[#EAF3DE] to-[#D4E8B8] text-[#3B6D11] shadow-sm" },
  { letter: "O", title: "Objetivos", desc: "Contribuir al desarrollo económico regional a través de servicios de alta calidad y acompañamiento continuo.", dotClass: "bg-gradient-to-br from-[#E6F1FB] to-[#C5DEFA] text-[#185FA5] shadow-sm" },
];

const values = [
  { name: "Transparencia", pct: 95, fillClass: "bg-gradient-to-r from-[#F5C775] to-[#E8A835]" },
  { name: "Compromiso", pct: 98, fillClass: "bg-gradient-to-r from-[#5DCAA5] to-[#1D9E75]" },
  { name: "Excelencia", pct: 90, fillClass: "bg-gradient-to-r from-[#85B7EB] to-[#378ADD]" },
  { name: "Innovación", pct: 85, fillClass: "bg-gradient-to-r from-[#F5C775] to-[#E8A835]" },
  { name: "Responsabilidad", pct: 97, fillClass: "bg-gradient-to-r from-[#5DCAA5] to-[#1D9E75]" },
];

const WhyUs = () => (
  <section className="bg-gradient-to-br from-secondary via-secondary to-[hsl(37,80%,97%)] py-16 px-8">
    <div className="text-center mb-10">
      <span className="inline-block bg-gold/10 text-gold text-[11px] tracking-[2px] font-semibold uppercase px-4 py-1.5 rounded-full mb-3">
        ¿Por qué elegirnos?
      </span>
      <h3 className="text-2xl md:text-3xl font-semibold text-foreground">
        Una empresa con propósito y valores sólidos
      </h3>
    </div>
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
          Fundada bajo los principios de transparencia, compromiso y excelencia, AME S.A.S. trabaja para ser el aliado estratégico de la microempresa colombiana.
        </p>
        <div className="flex flex-col gap-4">
          {pillars.map((p) => (
            <div key={p.letter} className="flex gap-4 items-start bg-card p-4 rounded-xl border border-border hover:border-gold/30 transition-colors shadow-sm">
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
        <h3 className="text-lg font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#F5C775] to-[#E8A835]">
          Nuestros principios
        </h3>
        {values.map((v) => (
          <div key={v.name} className="flex items-center gap-3 py-3 border-b border-primary-foreground/10 last:border-b-0">
            <span className="text-xs text-primary-foreground/80 min-w-[110px] font-medium">{v.name}</span>
            <div className="flex-1 h-2 bg-primary-foreground/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${v.fillClass} transition-all duration-1000`} style={{ width: `${v.pct}%` }} />
            </div>
            <span className="text-[11px] text-primary-foreground/50 min-w-[32px] text-right font-semibold">{v.pct}%</span>
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

export default WhyUs;
