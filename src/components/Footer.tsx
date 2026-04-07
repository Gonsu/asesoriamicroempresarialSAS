import { Phone, Mail, MapPin } from "lucide-react";
import logoAme from "@/assets/logo-ame.png";

const links = ["Inicio", "Empresa", "Servicios", "Noticias", "Contacto"];

const Footer = () => (
  <footer className="bg-ame-dark-surface px-8 py-8 flex justify-between items-center flex-wrap gap-4">
    <div className="flex items-center gap-3">
      <img src={logoAme} alt="AME S.A.S." className="h-9 w-auto" />
      <div className="text-xs text-primary-foreground/50">
        AME S.A.S. — Asesoría Microempresarial
        <br />
        <span className="text-[10px] opacity-50">© 2016 · Todos los derechos reservados</span>
      </div>
    </div>
    <div className="flex gap-5 flex-wrap">
      <a href="https://wa.me/3168308779" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary-foreground/50 text-[11px] hover:text-primary transition-colors font-medium">
        <Phone size={12} /> 316 830 8779
      </a>
      <a href="mailto:asesoriamsas@gmail.com" className="flex items-center gap-1.5 text-primary-foreground/50 text-[11px] hover:text-primary transition-colors font-medium">
        <Mail size={12} /> asesoriamsas@gmail.com
      </a>
      <a href="https://maps.app.goo.gl/K4ZsyQxgMnRXskWL8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary-foreground/50 text-[11px] hover:text-primary transition-colors font-medium">
        <MapPin size={12} /> Cll. 5 No. OA-114 2° Piso
      </a>
    </div>
    <div className="text-[11px] text-primary-foreground/30">Cúcuta, Colombia 🇨🇴</div>
  </footer>
);

export default Footer;
