import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Inicio", href: "#", active: true },
  { label: "Nuestra empresa", href: "#about" },
  { label: "Servicios", href: "#services" },
  { label: "Noticias", href: "#" },
  { label: "Contáctenos", href: "#contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-ame-dark px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center font-medium text-lg text-primary-foreground tracking-wider">
          A
        </div>
        <div>
          <h1 className="text-base font-medium tracking-[2px] text-primary-foreground">AME S.A.S.</h1>
          <p className="text-[10px] opacity-60 tracking-wider mt-0.5 text-primary-foreground">ASESORÍA MICROEMPRESARIAL</p>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex gap-1">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`text-xs px-3.5 py-1.5 rounded transition-all tracking-wide ${
              link.active
                ? "bg-gold/25 text-[#F5C775]"
                : "text-primary-foreground/75 hover:bg-gold/25 hover:text-[#F5C775]"
            }`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Mobile toggle */}
      <button className="md:hidden text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="absolute top-28 left-0 right-0 bg-ame-dark z-50 p-6 flex flex-col gap-2 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`text-sm px-4 py-2 rounded transition-all ${
                link.active
                  ? "bg-gold/25 text-[#F5C775]"
                  : "text-primary-foreground/75 hover:bg-gold/25 hover:text-[#F5C775]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Header;
