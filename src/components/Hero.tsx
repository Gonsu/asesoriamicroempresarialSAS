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
    <section className="relative overflow-visible md:overflow-hidden md:h-[550px]">
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img src={s.image} alt="" className="w-full h-full object-cover" width={1280} height={720} />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(214,30%,15%)]/90 via-[hsl(214,30%,15%)]/75 to-[hsl(210,30%,25%)]/60" />
        </div>
      ))}

      <div className="relative z-10 px-6 md:px-8 py-10 md:py-24 grid md:grid-cols-2 gap-6 md:gap-10 items-start md:items-center h-full overflow-y-auto">
        <div>
          <div className="inline-block bg-primary/20 text-primary text-xs font-medium px-3 py-1 rounded-full mb-4 backdrop-blur-sm border border-primary/30">
            ✦ Asesoría Microempresarial desde 2016
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[40px] font-semibold text-primary-foreground leading-tight mb-4">
            {slide.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DCAA5] to-[#1B6B3A]">{slide.highlight}</span>
          </h2>
          <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6 max-w-md">
            {slide.desc}
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="#services" className="bg-gradient-to-r from-primary to-[#1B6B3A] text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              Conocer servicios
            </a>
            <a href="#contact" className="bg-gradient-to-r from-accent to-[#2A8C5A] text-accent-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-accent/30 transition-all hover:-translate-y-0.5">
              Contáctenos
            </a>
            <a href="#about" className="border-2 border-primary-foreground/30 text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-foreground/10 transition-all backdrop-blur-sm">
              Nuestra empresa
            </a>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button onClick={prev} className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center text-primary-foreground/70 hover:bg-primary-foreground/10 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-primary" : "w-2 bg-primary-foreground/30"}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center text-primary-foreground/70 hover:bg-primary-foreground/10 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="bg-primary-foreground/[0.08] backdrop-blur-md rounded-2xl border border-primary-foreground/15 p-5 md:p-7 shadow-2xl">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-gradient-to-br from-primary-foreground/[0.1] to-primary-foreground/[0.03] rounded-xl p-4 md:p-5 text-center border border-primary-foreground/10 hover:border-primary/40 transition-colors">
                <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#5DCAA5] to-[#1B6B3A] leading-none">{s.num}</div>
                <div className="text-[10px] md:text-[11px] text-primary-foreground/55 mt-1.5 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-primary/20 border-l-[3px] border-primary rounded-r-lg px-4 py-3">
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
