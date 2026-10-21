import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { heroImages } from "@/assets/images";
import { mailtoUrl, site } from "@/config/site";
import { useSection } from "@/features/content/hooks";

const contacts = [
  { icon: Phone, text: site.phone.display, href: site.whatsappUrl },
  { icon: Mail, text: site.email, href: mailtoUrl },
  { icon: MapPin, text: `${site.address.street}, ${site.address.city}`, href: site.address.mapsUrl },
];

const CTA = () => {
  const ref = useScrollReveal();
  const content = useSection("cta");
  return (
    <section id="contact" ref={ref} className="relative overflow-hidden py-20 px-8 text-center">
      <img
        src={heroImages[2].src}
        srcSet={heroImages[2].srcSet}
        sizes="100vw"
        width={heroImages[2].width}
        height={heroImages[2].height}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(214,30%,15%)]/90 via-[hsl(210,30%,25%)]/85 to-[hsl(150,60%,26%)]/30" />
      <div className="relative z-10">
        {content.subtitle && (
          <span className="inline-block bg-primary/20 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm border border-primary/30">
            {content.subtitle}
          </span>
        )}
        <h2 className="text-2xl md:text-3xl font-semibold text-primary-foreground mb-3">{content.title}</h2>
        <p className="text-sm text-primary-foreground/65 mb-8 max-w-md mx-auto leading-relaxed">{content.description}</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-primary to-[#1B6B3A] text-primary-foreground px-8 py-3.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
            Solicitar asesoría
          </a>
          <Link to="/servicios" className="bg-gradient-to-r from-accent to-[#2A8C5A] text-accent-foreground px-8 py-3.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-accent/30 transition-all hover:-translate-y-0.5">
            Ver servicios
          </Link>
        </div>
        <div className="flex justify-center gap-4 md:gap-8 mt-10 flex-wrap">
          {contacts.map((c) => (
            <a
              key={c.text}
              href={c.href}
              target={c.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-primary-foreground/70 text-xs bg-primary-foreground/5 backdrop-blur-sm rounded-full px-4 py-2 border border-primary-foreground/10 hover:border-primary/40 hover:text-primary transition-colors"
            >
              <c.icon size={14} className="text-[#5DCAA5]" />
              {c.text}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTA;
