const contacts = [
  "316 830 8779",
  "asesoriamsas@gmail.com",
  "Cll. 5 No. OA-114 2° Piso, Cúcuta",
];

const CTA = () => (
  <section id="contact" className="gradient-cta py-14 px-8 text-center">
    <h2 className="text-2xl font-medium text-primary-foreground mb-3">
      ¿Listo para llevar tu empresa al siguiente nivel?
    </h2>
    <p className="text-sm text-primary-foreground/65 mb-7 max-w-md mx-auto leading-relaxed">
      Nuestro equipo de asesores está disponible para atenderte y diseñar una estrategia personalizada para tu negocio.
    </p>
    <div className="flex gap-3.5 justify-center flex-wrap">
      <a href="#" className="bg-gold text-primary-foreground px-6 py-2.5 rounded text-sm font-medium hover:opacity-85 transition-opacity">
        Solicitar asesoría
      </a>
      <a href="#" className="bg-ame-green text-primary-foreground px-6 py-2.5 rounded text-sm font-medium hover:opacity-85 transition-opacity">
        Ver servicios
      </a>
    </div>
    <div className="flex justify-center gap-8 mt-7 flex-wrap">
      {contacts.map((c) => (
        <div key={c} className="flex items-center gap-2 text-primary-foreground/60 text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5DCAA5]" />
          {c}
        </div>
      ))}
    </div>
  </section>
);

export default CTA;
