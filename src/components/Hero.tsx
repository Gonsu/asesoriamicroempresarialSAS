import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroConsulting from "@/assets/hero-consulting.jpg";
import heroEntrepreneur from "@/assets/hero-entrepreneur.jpg";
import heroTeam from "@/assets/hero-team.jpg";

const slides = [
  {
    image: heroConsulting,
    title: "Impulsamos el crecimiento de tu",
    highlight: "microempresa",
    desc: "Somos una sociedad comercial de economía privada dedicada a ofrecer servicios financieros y administrativos de alto impacto para pequeños empresarios en Colombia.",
  },
  {
    image: heroEntrepreneur,
    title: "Tu éxito es nuestra",
    highlight: "misión",
    desc: "Acompañamos a emprendedores y pequeños empresarios con soluciones financieras y administrativas personalizadas para cada etapa de su negocio.",
  },
  {
    image: heroTeam,
    title: "Un equipo comprometido con tu",
    highlight: "crecimiento",
    desc: "Profesionales con amplia trayectoria en el sector financiero y empresarial, listos para asesorarte y llevar tu empresa al siguiente nivel.",
  },
];

const stats = [
  { num: "+500", label: "Empresas asesoradas" },
  { num: "9+", label: "Años de experiencia" },
  { num: "100%", label: "Privada & legal" },
  { num: "3", label: "Áreas de servicio" },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt=""
            className="w-full h-full object-cover"
            width={1280}
            height={720}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(214,30%,15%)]/90 via-[hsl(214,30%,15%)]/75 to-[hsl(210,30%,25%)]/60" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-block bg-gold/20 text-[#F5C775] text-xs font-medium px-3 py-1 rounded-full mb-5 backdrop-blur-sm border border-gold/30">
            ✦ Asesoría Microempresarial desde 2016
          </div>
          <h2 className="text-3xl md:text-[40px] font-semibold text-primary-foreground leading-tight mb-5">
            {slide.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5C775] to-[#E8A835]">{slide.highlight}</span>
          </h2>
          <p className="text-primary-foreground/70 text-sm leading-relaxed mb-8 max-w-md">
            {slide.desc}
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="#services" className="bg-gradient-to-r from-gold to-[#D4941F] text-primary-foreground px-7 py-3 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-gold/30 transition-all hover:-translate-y-0.5">
              Conocer servicios
            </a>
            <a href="#contact" className="bg-gradient-to-r from-ame-green to-[#169563] text-primary-foreground px-7 py-3 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-ame-green/30 transition-all hover:-translate-y-0.5">
              Contáctenos
            </a>
            <a href="#about" className="border-2 border-primary-foreground/30 text-primary-foreground px-7 py-3 rounded-lg text-sm font-semibold hover:bg-primary-foreground/10 transition-all backdrop-blur-sm">
              Nuestra empresa
            </a>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center gap-4 mt-8">
            <button onClick={prev} className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center text-primary-foreground/70 hover:bg-primary-foreground/10 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-gold" : "w-2 bg-primary-foreground/30"}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center text-primary-foreground/70 hover:bg-primary-foreground/10 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Stats panel */}
        <div className="bg-primary-foreground/[0.08] backdrop-blur-md rounded-2xl border border-primary-foreground/15 p-7 shadow-2xl">
          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            {stats.map((s) => (
              <div key={s.label} className="bg-gradient-to-br from-primary-foreground/[0.1] to-primary-foreground/[0.03] rounded-xl p-5 text-center border border-primary-foreground/10 hover:border-gold/40 transition-colors">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#F5C775] to-[#E8A835] leading-none">{s.num}</div>
                <div className="text-[11px] text-primary-foreground/55 mt-2 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-ame-green/20 to-ame-green/10 border-l-[3px] border-ame-green rounded-r-lg px-4 py-4">
            <p className="text-xs italic text-primary-foreground/80 leading-relaxed">
              "Constituida conforme a las leyes de la República de Colombia, comprometida con el desarrollo económico regional."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
