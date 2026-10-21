import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import { heroImages } from "@/assets/images";
import { useSection } from "@/features/content/hooks";
import { splitHighlight } from "@/features/content/text";

const SLIDE_MS = 5500;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const HeroSimple = () => {
  const [current, setCurrent] = useState(0);
  // Sin avance automático si el sistema pide reducir el movimiento (WCAG 2.2.2).
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const content = useSection("hero");
  const title = splitHighlight(content.title, content.highlight);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % heroImages.length), SLIDE_MS);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <section
      className="relative overflow-hidden h-[420px] md:h-[520px]"
      aria-roledescription="carrusel"
      aria-label="Imágenes de portada"
    >
      {heroImages.map((img, i) => (
        <div
          key={img.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          {/* La primera foto es el LCP: se pide con prioridad alta; las demás, después. */}
          <img
            src={img.src}
            srcSet={img.srcSet}
            sizes="100vw"
            width={img.width}
            height={img.height}
            alt=""
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding={i === 0 ? "sync" : "async"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ame-dark/90 via-ame-dark/75 to-ame-dark/40" />
        </div>
      ))}

      <div className="relative z-10 h-full flex items-center px-6 md:px-16 max-w-5xl">
        <div>
          {content.subtitle && (
            <span className="inline-block bg-primary/20 text-[#5DCAA5] text-xs font-medium px-3 py-1 rounded-full mb-4 border border-primary/30">
              {content.subtitle}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-semibold text-primary-foreground leading-tight mb-4 max-w-2xl">
            {title ? (
              <>
                {title.before}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DCAA5] to-[#1B6B3A]">
                  {title.match}
                </span>
                {title.after}
              </>
            ) : (
              content.title
            )}
          </h1>
          <p className="text-primary-foreground/80 text-base leading-relaxed mb-8 max-w-lg">{content.description}</p>
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

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pausar el carrusel" : "Reanudar el carrusel"}
          className="h-8 w-8 flex items-center justify-center rounded-full text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
        >
          {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
        </button>
        {heroImages.map((img, i) => (
          // Área táctil de 24 px (WCAG 2.5.8) con el punto visual pequeño adentro.
          <button
            key={img.src}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Ir a la imagen ${i + 1} de ${heroImages.length}`}
            aria-current={i === current}
            className="h-6 min-w-6 px-1 flex items-center justify-center rounded-full"
          >
            <span
              className={`block h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-[#5DCAA5]" : "w-2 bg-primary-foreground/60"}`}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSimple;
