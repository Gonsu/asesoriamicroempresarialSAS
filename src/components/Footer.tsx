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
    <div className="flex gap-5">
      {links.map((l) => (
        <a key={l} href="#" className="text-primary-foreground/40 text-[11px] hover:text-primary transition-colors font-medium">
          {l}
        </a>
      ))}
    </div>
    <div className="text-[11px] text-primary-foreground/30">Cúcuta, Colombia 🇨🇴</div>
  </footer>
);

export default Footer;
