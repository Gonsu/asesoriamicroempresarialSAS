import { Home } from "lucide-react";
import aboutCucuta from "@/assets/about-cucuta.jpg";

const badges = [
  { label: "Economía privada", cls: "bg-gold/15 text-[#854F0B] border border-gold/20" },
  { label: "Sector financiero", cls: "bg-ame-green/15 text-[#3B6D11] border border-ame-green/20" },
  { label: "Consultoría", cls: "bg-ame-blue/15 text-[#185FA5] border border-ame-blue/20" },
  { label: "Registro legal", cls: "bg-gold/15 text-[#854F0B] border border-gold/20" },
];

const About = () => (
  <section id="about" className="py-16 px-8 bg-card">
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <div className="relative rounded-2xl overflow-hidden h-80 shadow-xl group">
        <img
          src={aboutCucuta}
          alt="Cúcuta, Norte de Santander"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          width={800}
          height={600}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(214,30%,15%)]/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-5 h-5 text-[#F5C775]" />
            <span className="text-primary-foreground text-sm font-medium">Nuestra sede</span>
          </div>
          <p className="text-primary-foreground/80 text-xs">Cúcuta, Norte de Santander — Colombia</p>
          <div className="flex gap-6 mt-4">
            {[
              { val: "2016", label: "Fundación", color: "text-[#F5C775]" },
              { val: "SAS", label: "Tipo societario", color: "text-[#5DCAA5]" },
              { val: "Col", label: "Sede nacional", color: "text-[#85B7EB]" },
            ].map((item, i) => (
              <div key={item.val} className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`text-xl font-bold ${item.color}`}>{item.val}</div>
                  <div className="text-[10px] text-primary-foreground/60">{item.label}</div>
                </div>
                {i < 2 && <div className="w-px h-8 bg-primary-foreground/20" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <span className="inline-block bg-gold/10 text-gold text-[11px] tracking-[2px] font-semibold uppercase px-4 py-1.5 rounded-full mb-3">
          Quiénes somos
        </span>
        <h2 className="text-2xl font-semibold text-card-foreground mb-4">Asesoría Microempresarial S.A.S.</h2>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
          Somos una sociedad comercial de economía privada, constituida conforme a las leyes de la República de Colombia. Nuestro equipo está conformado por profesionales con amplia trayectoria en el sector financiero y empresarial.
        </p>
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">
          Desde nuestra fundación hemos trabajado para democratizar el acceso a servicios de consultoría de calidad para pequeños y medianos empresarios de la región.
        </p>
        <div className="flex gap-2 flex-wrap">
          {badges.map((b) => (
            <span key={b.label} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold ${b.cls}`}>
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default About;
