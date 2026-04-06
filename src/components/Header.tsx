import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logoAme from "@/assets/logo-ame.png";

const empresaLinks = [
  { label: "Misión y Visión", href: "#empresa" },
  { label: "Objetivos", href: "#objetivos" },
  { label: "Quiénes somos", href: "#about" },
];

const navLinks = [
  { label: "Inicio", href: "#", active: true },
  { label: "Nuestra empresa", href: "#empresa", dropdown: empresaLinks },
  { label: "Servicios", href: "#services" },
  { label: "Reuniones", href: "#meetings" },
  { label: "Contáctenos", href: "#contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileEmpresaOpen, setMobileEmpresaOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-ame-dark px-8 py-4 flex justify-between items-center relative">
      <div className="flex items-center gap-3.5">
        <img src={logoAme} alt="AME S.A.S. Logo" className="h-16 md:h-12 w-auto" />
        <div className="hidden md:block">
          <h1 className="text-base font-semibold tracking-[2px] text-primary-foreground">AME S.A.S.</h1>
          <p className="text-[10px] opacity-60 tracking-wider mt-0.5 text-primary-foreground">ASESORÍA MICROEMPRESARIAL</p>
        </div>
      </div>

      <nav className="hidden md:flex gap-1">
        {navLinks.map((link) =>
          link.dropdown ? (
            <div key={link.label} className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`text-xs px-4 py-2 rounded-lg transition-all tracking-wide font-medium flex items-center gap-1 ${
                  dropdownOpen
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-primary-foreground/75 hover:bg-primary/15 hover:text-primary"
                }`}
              >
                {link.label}
                <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-ame-dark border border-primary-foreground/15 rounded-lg shadow-xl py-1 min-w-[180px] z-50">
                  {link.dropdown.map((sub) => (
                    <a
                      key={sub.label}
                      href={sub.href}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-xs text-primary-foreground/70 hover:bg-primary/15 hover:text-primary transition-colors"
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <a
              key={link.label}
              href={link.href}
              className={`text-xs px-4 py-2 rounded-lg transition-all tracking-wide font-medium ${
                link.active
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-primary-foreground/75 hover:bg-primary/15 hover:text-primary"
              }`}
            >
              {link.label}
            </a>
          )
        )}
      </nav>

      <button className="md:hidden text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-ame-dark z-50 p-6 flex flex-col gap-2 md:hidden border-t border-primary-foreground/10">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div key={link.label}>
                <button
                  onClick={() => setMobileEmpresaOpen(!mobileEmpresaOpen)}
                  className="w-full text-left text-sm px-4 py-2.5 rounded-lg text-primary-foreground/75 hover:bg-primary/15 hover:text-primary transition-all flex items-center justify-between"
                >
                  {link.label}
                  <ChevronDown size={14} className={`transition-transform ${mobileEmpresaOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileEmpresaOpen && (
                  <div className="ml-4 flex flex-col gap-1 mt-1">
                    {link.dropdown.map((sub) => (
                      <a
                        key={sub.label}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-xs px-4 py-2 rounded-lg text-primary-foreground/60 hover:bg-primary/15 hover:text-primary transition-colors"
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-sm px-4 py-2.5 rounded-lg transition-all ${
                  link.active
                    ? "bg-primary/20 text-primary"
                    : "text-primary-foreground/75 hover:bg-primary/15 hover:text-primary"
                }`}
              >
                {link.label}
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Header;
