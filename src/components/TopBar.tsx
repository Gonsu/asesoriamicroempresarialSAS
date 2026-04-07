import { Phone, Mail, MapPin } from "lucide-react";

const TopBar = () => (
  <div className="bg-ame-dark text-primary-foreground px-8 py-2 flex justify-between items-center text-xs">
    <span className="opacity-80">Cúcuta, Norte de Santander — Colombia</span>
    <span className="opacity-80 hidden md:flex items-center gap-4">
      <a href="https://maps.app.goo.gl/K4ZsyQxgMnRXskWL8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
        <MapPin size={10} /> Cll.5 No. OA-114 2°Piso Barrio Lleras
      </a>
      <a href="https://wa.me/3168308779" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
        <Phone size={10} /> 316 830 8779
      </a>
      <a href="mailto:asesoriamsas@gmail.com" className="flex items-center gap-1 hover:text-primary transition-colors">
        <Mail size={10} /> asesoriamsas@gmail.com
      </a>
    </span>
  </div>
);

export default TopBar;
