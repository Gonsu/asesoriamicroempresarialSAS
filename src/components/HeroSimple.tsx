import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroConsulting from "@/assets/hero-consulting.jpg";
import heroEntrepreneur from "@/assets/hero-entrepreneur.jpg";
import heroTeam from "@/assets/hero-team.jpg";

const slides = [heroConsulting, heroEntrepreneur, heroTeam];

const HeroSimple = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden h-[420px] md:h-[520px]">
      {slides.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img src={img} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ame-dark/90 via-ame-dark/75 to-ame-dark/40" />
        </div>
      ))}

      <div className="relative z-10 h-full flex items-center px-6 md:px-16 max-w-5xl">
        <div>
          <span className="inline-block bg-primary/20 text-primary text-xs font-medium px-3 py-1 rounded-full mb-4 border border-primary/30">
            Asesoría Microempresarial desde 2016
          </span>
          <h1 className="text-3xl md:text-5xl font-semibold text-primary-foreground leading-tight mb-4 max-w-2xl">
            Impulsamos el crecimiento de tu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DCAA5] to-[#1B6B3A]">
              microempresa
            </span>
          </h1>
          <p className="text-primary-foreground/80 text-base leading-relaxed mb-8 max-w-lg">
            Servicios financieros, administrativos y de consultoría para pequeños empresarios en Norte de Santander.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              to="/servicios"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Ver servicios
            </Link>
            <Link
              to="/contacto"
              className="border-2 border-primary-foreground/40 text-primary-foreground px-6 py-3 rounded-md text-sm font-semibold hover:bg-primary-foreground/10 transition-colors"
            >
              Contáctenos
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Ir a diapositiva ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-primary" : "w-2 bg-primary-foreground/40"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSimple;
