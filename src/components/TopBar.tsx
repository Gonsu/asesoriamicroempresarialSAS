import { Phone, Mail, MapPin } from "lucide-react";
import { mailtoUrl, site } from "@/config/site";

const TopBar = () => (
  <div className="bg-ame-dark text-primary-foreground px-8 py-2 flex justify-between items-center text-xs">
    <span className="opacity-80">Cúcuta, Norte de Santander — Colombia</span>
    <span className="opacity-80 hidden md:flex items-center gap-4">
      <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
        <MapPin size={10} /> {site.address.street} {site.address.neighborhood}
      </a>
      <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
        <Phone size={10} /> {site.phone.display}
      </a>
      <a href={mailtoUrl} className="flex items-center gap-1 hover:text-primary transition-colors">
        <Mail size={10} /> {site.email}
      </a>
    </span>
  </div>
);

export default TopBar;
