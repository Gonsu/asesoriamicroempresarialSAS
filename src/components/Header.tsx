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
    <div className="bg-ame-dark px-8 py-4 flex justify-between items-center relative">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-[#D4941F] flex items-center justify-center font-bold text-lg text-primary-foreground tracking-wider shadow-lg shadow-gold/30">
          A
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-[2px] text-primary-foreground">AME S.A.S.</h1>
          <p className="text-[10px] opacity-60 tracking-wider mt-0.5 text-primary-foreground">ASESORÍA MICROEMPRESARIAL</p>
        </div>
      </div>

      <nav className="hidden md:flex gap-1">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={`text-xs px-4 py-2 rounded-lg transition-all tracking-wide font-medium ${
              link.active
                ? "bg-gold/20 text-[#F5C775] border border-gold/30"
                : "text-primary-foreground/75 hover:bg-gold/15 hover:text-[#F5C775]"
            }`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <button className="md:hidden text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-ame-dark z-50 p-6 flex flex-col gap-2 md:hidden border-t border-primary-foreground/10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`text-sm px-4 py-2.5 rounded-lg transition-all ${
                link.active
                  ? "bg-gold/20 text-[#F5C775]"
                  : "text-primary-foreground/75 hover:bg-gold/15 hover:text-[#F5C775]"
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
