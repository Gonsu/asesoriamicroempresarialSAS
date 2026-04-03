const stats = [
  { num: "+500", label: "Empresas asesoradas" },
  { num: "9+", label: "Años de experiencia" },
  { num: "100%", label: "Privada & legal" },
  { num: "3", label: "Áreas de servicio" },
];

const Hero = () => (
  <section className="gradient-hero px-8 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
    <div className="animate-fade-in-up">
      <h2 className="text-3xl md:text-4xl font-medium text-primary-foreground leading-tight mb-4">
        Impulsamos el crecimiento de tu <span className="text-[#F5C775]">microempresa</span>
      </h2>
      <p className="text-primary-foreground/70 text-sm leading-relaxed mb-7 max-w-md">
        Somos una sociedad comercial de economía privada dedicada a ofrecer servicios financieros y administrativos de alto impacto para pequeños empresarios en Colombia.
      </p>
      <div className="flex gap-3 flex-wrap">
        <a href="#services" className="bg-gold text-primary-foreground px-6 py-2.5 rounded text-sm font-medium hover:opacity-85 transition-opacity">
          Conocer servicios
        </a>
        <a href="#contact" className="bg-ame-green text-primary-foreground px-6 py-2.5 rounded text-sm font-medium hover:opacity-85 transition-opacity">
          Contáctenos
        </a>
        <a href="#about" className="border border-primary-foreground/35 text-primary-foreground px-6 py-2.5 rounded text-sm font-medium hover:bg-primary-foreground/10 transition-colors">
          Nuestra empresa
        </a>
      </div>
    </div>

    <div className="bg-primary-foreground/[0.06] rounded-lg border border-primary-foreground/15 p-7 animate-fade-in-up-delay-2">
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        {stats.map((s) => (
          <div key={s.label} className="bg-primary-foreground/[0.07] rounded-lg p-4 text-center border border-primary-foreground/10">
            <div className="text-2xl font-medium text-[#F5C775] leading-none">{s.num}</div>
            <div className="text-[11px] text-primary-foreground/55 mt-1.5 tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-ame-green/15 border-l-[3px] border-ame-green rounded-r-md px-4 py-3.5">
        <p className="text-xs italic text-primary-foreground/75 leading-relaxed">
          "Constituida conforme a las leyes de la República de Colombia, comprometida con el desarrollo económico regional."
        </p>
      </div>
    </div>
  </section>
);

export default Hero;
