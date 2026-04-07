import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import logoAme from "@/assets/logo-ame.png";
import { useScrollDirection } from "@/hooks/useScrollDirection";

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
  const hidden = useScrollDirection();

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
    <>
      {/* Mobile: Large logo banner like reference site */}
      <div
        className={`md:hidden bg-[#f5f0e8] flex items-center justify-center py-6 px-4 sticky top-0 z-50 transition-transform duration-300 ease-in-out border-b-4 border-[#8B6914] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <img src={logoAme} alt="Asesoría Microempresarial S.A.S." className="h-28 w-auto max-w-[85%] object-contain" />
        <button className="absolute top-4 right-4 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop header */}
      <div
        className={`hidden md:flex bg-ame-dark px-8 py-4 justify-between items-center sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <img src={logoAme} alt="AME S.A.S. Logo" className="h-14 w-auto" />
          <div>
            <h1 className="text-base font-semibold tracking-[2px] text-primary-foreground">AME S.A.S.</h1>
            <p className="text-[10px] opacity-60 tracking-wider mt-0.5 text-primary-foreground">ASESORÍA MICROEMPRESARIAL</p>
          </div>
        </div>

        <nav className="flex gap-1">
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
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[160px] bg-ame-dark z-50 p-6 flex flex-col gap-2 md:hidden border-t border-primary-foreground/10 overflow-y-auto">
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
    </>
  );
};

export default Header;
