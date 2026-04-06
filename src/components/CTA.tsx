import { Phone, Mail, MapPin } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroTeam from "@/assets/hero-team.jpg";

const contacts = [
  { icon: Phone, text: "316 830 8779" },
  { icon: Mail, text: "asesoriamsas@gmail.com" },
  { icon: MapPin, text: "Cll. 5 No. OA-114 2° Piso, Cúcuta" },
];

const CTA = () => {
  const ref = useScrollReveal();
  return (
    <section id="contact" ref={ref} className="relative overflow-hidden py-20 px-8 text-center">
      <img src={heroTeam} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(214,30%,15%)]/90 via-[hsl(210,30%,25%)]/85 to-[hsl(150,60%,26%)]/30" />
      <div className="relative z-10">
        <span className="inline-block bg-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm border border-primary/30">
          ¿Listo para empezar?
        </span>
        <h2 className="text-2xl md:text-3xl font-semibold text-primary-foreground mb-3">
          Lleva tu empresa al siguiente nivel
        </h2>
        <p className="text-sm text-primary-foreground/65 mb-8 max-w-md mx-auto leading-relaxed">
          Nuestro equipo de asesores está disponible para atenderte y diseñar una estrategia personalizada para tu negocio.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="#" className="bg-gradient-to-r from-primary to-[#1B6B3A] text-primary-foreground px-8 py-3.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
            Solicitar asesoría
          </a>
          <a href="#services" className="bg-gradient-to-r from-accent to-[#2A8C5A] text-accent-foreground px-8 py-3.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-accent/30 transition-all hover:-translate-y-0.5">
            Ver servicios
          </a>
        </div>
        <div className="flex justify-center gap-8 mt-10 flex-wrap">
          {contacts.map((c) => (
            <div key={c.text} className="flex items-center gap-2.5 text-primary-foreground/70 text-xs bg-primary-foreground/5 backdrop-blur-sm rounded-full px-4 py-2 border border-primary-foreground/10">
              <c.icon size={14} className="text-[#5DCAA5]" />
              {c.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTA;
