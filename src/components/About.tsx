import { Home } from "lucide-react";

const badges = [
  { label: "Economía privada", cls: "bg-gold-light text-[#854F0B]" },
  { label: "Sector financiero", cls: "bg-ame-green-light text-[#3B6D11]" },
  { label: "Consultoría", cls: "bg-ame-blue-light text-[#185FA5]" },
  { label: "Registro legal", cls: "bg-gold-light text-[#854F0B]" },
];

const About = () => (
  <section id="about" className="py-14 px-8 bg-card">
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div className="bg-secondary rounded-lg h-72 flex flex-col items-center justify-center border border-border gap-3">
        <div className="w-16 h-16 rounded-full bg-ame-dark flex items-center justify-center">
          <Home className="w-7 h-7 text-[#F5C775]" />
        </div>
        <p className="text-[13px] text-muted-foreground text-center px-6">
          Cúcuta, Norte de Santander<br />Colombia
        </p>
        <div className="flex gap-5 mt-2">
          {[
            { val: "2016", label: "Fundación", color: "text-gold" },
            { val: "SAS", label: "Tipo societario", color: "text-ame-green" },
            { val: "Col", label: "Sede nacional", color: "text-ame-blue" },
          ].map((item, i) => (
            <div key={item.val} className="flex items-center gap-5">
              <div className="text-center">
                <div className={`text-lg font-medium ${item.color}`}>{item.val}</div>
                <div className="text-[10px] text-muted-foreground">{item.label}</div>
              </div>
              {i < 2 && <div className="w-px h-8 bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] tracking-[2px] text-gold font-medium uppercase mb-2">Quiénes somos</p>
        <h2 className="text-xl font-medium text-card-foreground mb-4">Asesoría Microempresarial S.A.S.</h2>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
          Somos una sociedad comercial de economía privada, constituida conforme a las leyes de la República de Colombia. Nuestro equipo está conformado por profesionales con amplia trayectoria en el sector financiero y empresarial.
        </p>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">
          Desde nuestra fundación hemos trabajado para democratizar el acceso a servicios de consultoría de calidad para pequeños y medianos empresarios de la región.
        </p>
        <div className="flex gap-2 flex-wrap">
          {badges.map((b) => (
            <span key={b.label} className={`px-3 py-1 rounded-full text-[11px] font-medium ${b.cls}`}>
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default About;
