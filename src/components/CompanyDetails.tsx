import { useState } from "react";
import { Target, Briefcase, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const tabs = [
  { id: "objetivos", label: "Objetivos", icon: Target },
  { id: "objeto", label: "Objeto Social", icon: Briefcase },
  { id: "comite", label: "Comité Asesor", icon: Users },
];

const objetivosEspecificos = [
  "Lograr que la participación de Mercado de Asesoría Microempresarial S.A.S. tenga un crecimiento sostenido.",
  "Incursionar en el mercado local a través del desarrollo de servicios vinculados al objeto social como la Capacitación, que permitan el desarrollo y fortalecimiento de la pequeña empresa.",
  "Mantener tarifas diferenciales, acordadas con los representantes del estado y los accionistas, buscando asegurar la permanencia y desarrollo del negocio a mediano y largo plazo.",
  "Establecer la Sociedad como una organización flexible y eficiente, orientada al cliente, con recursos humanos competentes, procesos y sistemas de gestión óptimos.",
  "Promover el mejoramiento continuo orientado en la base del servicio como un compromiso desde los órganos de administración y personal de la sociedad.",
];

const objetoSocial = [
  "La planeación, diseño, optimización, puesta en servicio, operación, administración o gerenciamiento de Microempresas que atiendan mercados de bienes y servicios.",
  "Gestionar el emprendimiento de proyectos productivos (agropecuarios o industriales), de transformación, comerciales y prestación de servicios, desarrollados por personas naturales o asociativos.",
  "Apoyar el fortalecimiento de microempresas en proceso de desarrollo.",
  "Asesorar y capacitar el talento humano de las microempresas.",
];

const CompanyDetails = () => {
  const [activeTab, setActiveTab] = useState("objetivos");
  const ref = useScrollReveal();

  return (
    <section id="objetivos" ref={ref} className="py-16 px-8 bg-card">
      <div className="text-center mb-10">
        <span className="inline-block bg-primary/10 text-primary text-[11px] tracking-[2px] font-semibold uppercase px-4 py-1.5 rounded-full mb-3">
          Nuestra empresa
        </span>
        <h3 className="text-2xl md:text-3xl font-semibold text-card-foreground mb-3">
          Conoce más sobre nosotros
        </h3>
      </div>

      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        {activeTab === "objetivos" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h4 className="text-base font-semibold text-card-foreground mb-4">Objetivos Específicos</h4>
            {objetivosEspecificos.map((obj, i) => (
              <div key={i} className="flex gap-3 items-start bg-secondary/50 p-4 rounded-xl border border-border">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "objeto" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h4 className="text-base font-semibold text-card-foreground mb-2">Objeto Social</h4>
            <p className="text-xs text-muted-foreground mb-4">
              La sociedad tiene como objeto social, el desarrollo de las siguientes actividades:
            </p>
            {objetoSocial.map((item, i) => (
              <div key={i} className="flex gap-3 items-start bg-secondary/50 p-4 rounded-xl border border-border">
                <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-accent">{String.fromCharCode(97 + i)})</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "comite" && (
          <div className="animate-in fade-in duration-300">
            <h4 className="text-base font-semibold text-card-foreground mb-4">Comité Asesor</h4>
            <div className="bg-gradient-to-br from-ame-dark to-ame-mid rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4F0E0] to-[#A8DFC0] flex items-center justify-center">
                  <Users size={18} className="text-primary" />
                </div>
                <h5 className="text-sm font-semibold text-primary-foreground">Junta Directiva</h5>
              </div>
              <p className="text-xs text-primary-foreground/70 leading-relaxed">
                La Junta Directiva podrá crear comités asesores para realizar trabajos especializados, coordinados por el Gerente de la sociedad, para que estudien y sometan a consideración de la Junta Directiva, temas de importancia para la compañía. La Junta Directiva reglamentará la composición, funcionamiento y remuneración de los Comités Asesores.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CompanyDetails;
