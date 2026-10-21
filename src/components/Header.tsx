import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { logoImage } from "@/assets/images";
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

// Verde claro de la marca: sobre el fondo oscuro del encabezado el verde primario no alcanza
// el contraste mínimo (4,5:1).
const ACTIVE = "text-[#5DCAA5]";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileEmpresaOpen, setMobileEmpresaOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const hidden = useScrollDirection();
  const location = useLocation();

  // Clic fuera cierra el submenú; Escape cierra el submenú o el menú móvil y devuelve el foco.
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (dropdownOpen) {
        setDropdownOpen(false);
        dropdownButtonRef.current?.focus();
      } else if (mobileOpen) {
        setMobileOpen(false);
        mobileButtonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [dropdownOpen, mobileOpen]);

  const linkClasses = (isActive: boolean) =>
    cn(
      "relative text-sm px-4 py-2 transition-colors font-medium tracking-normal",
      isActive
        ? `${ACTIVE} after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:bg-[#5DCAA5]`
        : "text-primary-foreground/85 hover:text-[#5DCAA5]",
    );

  const isEmpresaActive = location.pathname === "/empresa";

  return (
    <>
      {/* Mobile: Large logo banner */}
      <div
        className={cn(
          "md:hidden bg-[#f5f0e8] flex items-center justify-center py-6 px-4 sticky top-0 z-50 transition-transform duration-300 ease-in-out border-b-2 border-primary/20",
          hidden ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <NavLink to="/" aria-label="Asesoría Microempresarial S.A.S. — Inicio" className="max-w-[90%] flex justify-center">
          <img
            src={logoImage.src}
            width={logoImage.width}
            height={logoImage.height}
            alt=""
            className="h-28 w-auto max-w-full object-contain"
          />
        </NavLink>
        <button
          ref={mobileButtonRef}
          type="button"
          className="absolute top-3 right-3 h-11 w-11 flex items-center justify-center rounded-md text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
          aria-controls="menu-movil"
        >
          {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Desktop header */}
      <header
        className={cn(
          "hidden md:flex bg-ame-dark px-8 py-3 justify-between items-center sticky top-0 z-50 transition-transform duration-300 ease-in-out shadow-sm",
          hidden ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <NavLink to="/" className="flex items-center gap-3">
          {/* El nombre está escrito al lado: el logo es decorativo para lectores de pantalla. */}
          <img src={logoImage.src} width={logoImage.width} height={logoImage.height} alt="" className="h-12 w-auto" />
          <div>
            <span className="block text-base font-semibold text-primary-foreground leading-tight">AME S.A.S.</span>
            <span className="block text-[11px] text-primary-foreground/70 leading-tight">Asesoría Microempresarial</span>
          </div>
        </NavLink>

        <nav aria-label="Principal" className="flex items-center">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div key={link.label} className="relative" ref={dropdownRef}>
                <button
                  ref={dropdownButtonRef}
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                  aria-controls="submenu-empresa"
                  className={cn(linkClasses(isEmpresaActive), "flex items-center gap-1")}
                >
                  {link.label}
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={cn("transition-transform", dropdownOpen && "rotate-180")}
                  />
                </button>
                {dropdownOpen && (
                  <ul
                    id="submenu-empresa"
                    className="absolute top-full right-0 mt-1 bg-ame-dark border border-primary-foreground/15 rounded-md shadow-xl py-1 min-w-[200px] z-50"
                  >
                    {link.dropdown.map((sub) => (
                      <li key={sub.label}>
                        <NavLink
                          to={sub.to}
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-primary-foreground/85 hover:bg-primary/15 hover:text-[#5DCAA5] transition-colors"
                        >
                          {sub.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
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
            ),
          )}
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <nav
          id="menu-movil"
          aria-label="Principal"
          className="fixed inset-x-0 top-[152px] bottom-0 bg-ame-dark z-40 p-6 flex flex-col gap-1 md:hidden border-t border-primary-foreground/10 overflow-y-auto"
        >
          {navLinks.map((link) =>
            link.dropdown ? (
              <div key={link.label}>
                <button
                  type="button"
                  onClick={() => setMobileEmpresaOpen(!mobileEmpresaOpen)}
                  aria-expanded={mobileEmpresaOpen}
                  aria-controls="submenu-empresa-movil"
                  className="w-full text-left text-base px-4 py-3 rounded-md text-primary-foreground/85 hover:bg-primary/15 hover:text-[#5DCAA5] transition-all flex items-center justify-between"
                >
                  {link.label}
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={cn("transition-transform", mobileEmpresaOpen && "rotate-180")}
                  />
                </button>
                {mobileEmpresaOpen && (
                  <div id="submenu-empresa-movil" className="ml-4 flex flex-col gap-1 mt-1">
                    {link.dropdown.map((sub) => (
                      <NavLink
                        key={sub.label}
                        to={sub.to}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm px-4 py-2 rounded-md text-primary-foreground/75 hover:bg-primary/15 hover:text-[#5DCAA5] transition-colors"
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
                      ? `bg-primary/20 ${ACTIVE}`
                      : "text-primary-foreground/85 hover:bg-primary/15 hover:text-[#5DCAA5]",
                  )
                }
              >
                {link.label}
              </NavLink>
            ),
          )}
        </nav>
      )}
    </>
  );
};

export default Header;
