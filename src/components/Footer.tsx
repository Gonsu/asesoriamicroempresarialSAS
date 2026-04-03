const links = ["Inicio", "Empresa", "Servicios", "Noticias", "Contacto"];

const Footer = () => (
  <footer className="bg-ame-dark-surface px-8 py-8 flex justify-between items-center flex-wrap gap-4">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-[#D4941F] flex items-center justify-center text-xs text-primary-foreground font-bold shadow-lg shadow-gold/20">
        A
      </div>
      <div className="text-xs text-primary-foreground/50">
        AME S.A.S. — Asesoría Microempresarial
        <br />
        <span className="text-[10px] opacity-50">© 2016 · Todos los derechos reservados</span>
      </div>
    </div>
    <div className="flex gap-5">
      {links.map((l) => (
        <a key={l} href="#" className="text-primary-foreground/40 text-[11px] hover:text-[#F5C775] transition-colors font-medium">
          {l}
        </a>
      ))}
    </div>
    <div className="text-[11px] text-primary-foreground/30">Cúcuta, Colombia 🇨🇴</div>
  </footer>
);

export default Footer;
