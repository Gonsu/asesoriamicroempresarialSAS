import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import logoAme from "@/assets/logo-ame.png";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { cn } from "@/lib/utils";

const empresaLinks = [
  { label: "Quiénes somos", to: "/empresa#quienes" },
  { label: "Misión y Visión", to: "/empresa#mision" },
  { label: "Objetivos", to: "/empresa#objetivos" },
  { label: "Comité asesor", to: "/empresa#comite" },
];

const navLinks = [
  { label: "Inicio", to: "/" },
  { label: "Nuestra empresa", to: "/empresa", dropdown: empresaLinks },
  { label: "Servicios", to: "/servicios" },
  { label: "Reuniones", to: "/reuniones" },
  { label: "Contáctenos", to: "/contacto" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileEmpresaOpen, setMobileEmpresaOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hidden = useScrollDirection();
  const location = useLocation();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const linkClasses = (isActive: boolean) =>
    cn(
      "relative text-sm px-4 py-2 transition-colors font-medium tracking-normal",
      isActive
        ? "text-primary after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-primary"
        : "text-primary-foreground/85 hover:text-primary"
    );

  const isEmpresaActive = location.pathname === "/empresa";

  return (
    <>
      {/* Mobile: Large logo banner */}
      <div
        className={cn(
          "md:hidden bg-[#f5f0e8] flex items-center justify-center py-6 px-4 sticky top-0 z-50 transition-transform duration-300 ease-in-out border-b-2 border-primary/20",
          hidden ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <img src={logoAme} alt="Asesoría Microempresarial S.A.S." className="h-28 w-auto max-w-[90%] object-contain" />
        <button className="absolute top-4 right-4 text-foreground" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menú">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop header */}
      <div
        className={cn(
          "hidden md:flex bg-ame-dark px-8 py-3 justify-between items-center sticky top-0 z-50 transition-transform duration-300 ease-in-out shadow-sm",
          hidden ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <NavLink to="/" className="flex items-center gap-3">
          <img src={logoAme} alt="AME S.A.S. Logo" className="h-12 w-auto" />
          <div>
            <h1 className="text-base font-semibold text-primary-foreground leading-tight">AME S.A.S.</h1>
            <p className="text-[11px] text-primary-foreground/60 leading-tight">Asesoría Microempresarial</p>
          </div>
        </NavLink>

        <nav className="flex items-center">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div key={link.label} className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    linkClasses(isEmpresaActive),
                    "flex items-center gap-1"
                  )}
                >
                  {link.label}
                  <ChevronDown size={14} className={cn("transition-transform", dropdownOpen && "rotate-180")} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-ame-dark border border-primary-foreground/15 rounded-md shadow-xl py-1 min-w-[200px] z-50">
                    {link.dropdown.map((sub) => (
                      <NavLink
                        key={sub.label}
                        to={sub.to}
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-primary-foreground/80 hover:bg-primary/15 hover:text-primary transition-colors"
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => linkClasses(isActive)}
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[152px] bottom-0 bg-ame-dark z-40 p-6 flex flex-col gap-1 md:hidden border-t border-primary-foreground/10 overflow-y-auto">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div key={link.label}>
                <button
                  onClick={() => setMobileEmpresaOpen(!mobileEmpresaOpen)}
                  className="w-full text-left text-base px-4 py-3 rounded-md text-primary-foreground/85 hover:bg-primary/15 hover:text-primary transition-all flex items-center justify-between"
                >
                  {link.label}
                  <ChevronDown size={16} className={cn("transition-transform", mobileEmpresaOpen && "rotate-180")} />
                </button>
                {mobileEmpresaOpen && (
                  <div className="ml-4 flex flex-col gap-1 mt-1">
                    {link.dropdown.map((sub) => (
                      <NavLink
                        key={sub.label}
                        to={sub.to}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm px-4 py-2 rounded-md text-primary-foreground/65 hover:bg-primary/15 hover:text-primary transition-colors"
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "text-base px-4 py-3 rounded-md transition-all font-medium",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-primary-foreground/85 hover:bg-primary/15 hover:text-primary"
                  )
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </div>
      )}
    </>
  );
};

export default Header;
