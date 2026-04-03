const pillars = [
  { letter: "M", title: "Misión", desc: "Brindar soluciones financieras y administrativas que fortalezcan la competitividad de nuestros clientes.", dotClass: "bg-gold-light text-[#854F0B]" },
  { letter: "V", title: "Visión", desc: "Ser la empresa líder en asesoría microempresarial en el nororiente colombiano para 2030.", dotClass: "bg-ame-green-light text-[#3B6D11]" },
  { letter: "O", title: "Objetivos", desc: "Contribuir al desarrollo económico regional a través de servicios de alta calidad y acompañamiento continuo.", dotClass: "bg-ame-blue-light text-[#185FA5]" },
];

const values = [
  { name: "Transparencia", pct: 95, fillClass: "bg-[#F5C775]" },
  { name: "Compromiso", pct: 98, fillClass: "bg-[#5DCAA5]" },
  { name: "Excelencia", pct: 90, fillClass: "bg-[#85B7EB]" },
  { name: "Innovación", pct: 85, fillClass: "bg-[#F5C775]" },
  { name: "Responsabilidad", pct: 97, fillClass: "bg-[#5DCAA5]" },
];

const WhyUs = () => (
  <section className="bg-secondary py-14 px-8">
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div>
        <p className="text-[11px] tracking-[2px] text-gold font-medium uppercase mb-2">¿Por qué elegirnos?</p>
        <h3 className="text-xl font-medium text-foreground mb-4">Una empresa con propósito y valores sólidos</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
          Fundada bajo los principios de transparencia, compromiso y excelencia, AME S.A.S. trabaja para ser el aliado estratégico de la microempresa colombiana.
        </p>
        <div className="flex flex-col gap-3.5">
          {pillars.map((p) => (
            <div key={p.letter} className="flex gap-3.5 items-start">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium ${p.dotClass}`}>
                {p.letter}
              </div>
              <div>
                <h4 className="text-[13px] font-medium text-foreground mb-1">{p.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-ame-dark rounded-lg p-7">
        <h3 className="text-base font-medium mb-5 text-[#F5C775]">Nuestros principios</h3>
        {values.map((v) => (
          <div key={v.name} className="flex items-center gap-3 py-2.5 border-b border-primary-foreground/10 last:border-b-0">
            <span className="text-xs text-primary-foreground/75 min-w-[100px]">{v.name}</span>
            <div className="flex-1 h-1 bg-primary-foreground/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${v.fillClass}`} style={{ width: `${v.pct}%` }} />
            </div>
            <span className="text-[11px] text-primary-foreground/45 min-w-[28px] text-right">{v.pct}%</span>
          </div>
        ))}
        <div className="mt-5 pt-4 border-t border-primary-foreground/10">
          <p className="text-[11px] text-primary-foreground/40 text-center">
            Sociedad constituida conforme a las leyes de la República de Colombia · Reg. 2016
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default WhyUs;
