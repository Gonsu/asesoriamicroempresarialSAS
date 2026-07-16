const stats = [
  { num: "+500", label: "Empresas asesoradas" },
  { num: "9+", label: "Años de experiencia" },
  { num: "100%", label: "Privada & legal" },
  { num: "3", label: "Áreas de servicio" },
];

const StatsBand = () => (
  <section className="bg-ame-dark py-12 px-6 md:px-8">
    <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      {stats.map((s) => (
        <div key={s.label}>
          <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#5DCAA5] to-[#1B6B3A]">
            {s.num}
          </div>
          <div className="text-xs md:text-sm text-primary-foreground/70 mt-2">{s.label}</div>
        </div>
      ))}
    </div>
  </section>
);

export default StatsBand;
