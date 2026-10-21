import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import { logoImage } from "@/assets/images";
import { mailtoUrl, site } from "@/config/site";
import { Link } from "react-router-dom";
import { useSection } from "@/features/content/hooks";
import { useConsent } from "@/features/consent/useConsent";

const Footer = () => {
  const content = useSection("footer");
  const { openSettings } = useConsent();
  return (
    <footer className="bg-ame-dark-surface px-8 py-8 flex justify-between items-center flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <img src={logoImage.src} width={logoImage.width} height={logoImage.height} alt={site.shortName} className="h-9 w-auto" />
        <div className="text-xs text-primary-foreground/75">
          {content.title}
          <br />
          <span className="text-[10px] text-primary-foreground/70">© {site.foundingYear} · {content.description}</span>
        </div>
      </div>
      <div className="flex gap-5 flex-wrap items-center">
        <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary-foreground/75 text-[11px] hover:text-[#5DCAA5] transition-colors font-medium">
          <Phone size={12} /> {site.phone.display}
        </a>
        <a href={mailtoUrl} className="flex items-center gap-1.5 text-primary-foreground/75 text-[11px] hover:text-[#5DCAA5] transition-colors font-medium">
          <Mail size={12} /> {site.email}
        </a>
        <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary-foreground/75 text-[11px] hover:text-[#5DCAA5] transition-colors font-medium">
          <MapPin size={12} /> {site.address.street}
        </a>
        <span className="hidden md:inline text-primary-foreground/20">|</span>
        <div className="flex gap-3">
          <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-primary-foreground/75 hover:text-[#5DCAA5] hover:scale-110 transition-all duration-300">
            <Facebook size={16} />
          </a>
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/75 hover:text-[#5DCAA5] hover:scale-110 transition-all duration-300">
            <Instagram size={16} />
          </a>
        </div>
      </div>
      <div className="text-[11px] text-primary-foreground/70">Cúcuta, Colombia 🇨🇴</div>
      <nav aria-label="Información legal" className="w-full flex flex-wrap gap-x-5 gap-y-2 justify-center border-t border-primary-foreground/10 pt-4 text-[11px]">
        <Link to="/politica-de-datos" className="text-primary-foreground/75 hover:text-[#5DCAA5] transition-colors">
          Política de tratamiento de datos
        </Link>
        <Link to="/terminos" className="text-primary-foreground/75 hover:text-[#5DCAA5] transition-colors">
          Términos de uso
        </Link>
        <button type="button" onClick={openSettings} className="text-primary-foreground/75 hover:text-[#5DCAA5] transition-colors">
          Preferencias de cookies
        </button>
      </nav>
    </footer>
  );
};

export default Footer;
