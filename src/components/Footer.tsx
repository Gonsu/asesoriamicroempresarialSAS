import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import logoAme from "@/assets/logo-ame.png";
import { mailtoUrl, site } from "@/config/site";
import { useSection } from "@/features/content/hooks";

const Footer = () => {
  const content = useSection("footer");
  return (
    <footer className="bg-ame-dark-surface px-8 py-8 flex justify-between items-center flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <img src={logoAme} alt={site.shortName} className="h-9 w-auto" />
        <div className="text-xs text-primary-foreground/50">
          {content.title}
          <br />
          <span className="text-[10px] opacity-50">© {site.foundingYear} · {content.description}</span>
        </div>
      </div>
      <div className="flex gap-5 flex-wrap items-center">
        <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary-foreground/50 text-[11px] hover:text-primary transition-colors font-medium">
          <Phone size={12} /> {site.phone.display}
        </a>
        <a href={mailtoUrl} className="flex items-center gap-1.5 text-primary-foreground/50 text-[11px] hover:text-primary transition-colors font-medium">
          <Mail size={12} /> {site.email}
        </a>
        <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary-foreground/50 text-[11px] hover:text-primary transition-colors font-medium">
          <MapPin size={12} /> {site.address.street}
        </a>
        <span className="hidden md:inline text-primary-foreground/20">|</span>
        <div className="flex gap-3">
          <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-primary-foreground/50 hover:text-primary hover:scale-110 transition-all duration-300">
            <Facebook size={16} />
          </a>
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/50 hover:text-primary hover:scale-110 transition-all duration-300">
            <Instagram size={16} />
          </a>
        </div>
      </div>
      <div className="text-[11px] text-primary-foreground/30">Cúcuta, Colombia 🇨🇴</div>
    </footer>
  );
};

export default Footer;
