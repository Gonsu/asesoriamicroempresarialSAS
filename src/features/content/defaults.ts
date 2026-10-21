// Textos de las secciones editables desde el panel (tabla site_content). Son los valores
// por defecto: se muestran si la consulta falla o si un campo está vacío en la base de datos.
// supabase/seed.sql debe tener exactamente estos textos (lo comprueba content.test.ts).
//
// Campos: subtitle es la etiqueta pequeña sobre el encabezado, title el encabezado y
// description el texto; una línea en blanco separa párrafos.

export const SECTION_KEYS = ["hero", "home_about", "about", "services", "whyus", "cta", "footer"] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export interface SectionContent {
  title: string;
  subtitle: string;
  description: string;
  /** Palabra del título que se muestra resaltada (solo hero). */
  highlight: string;
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "🏠 Hero (Inicio)",
  home_about: "👥 Quiénes Somos (Inicio)",
  about: "👥 Quiénes Somos (Empresa)",
  services: "💼 Servicios (Inicio)",
  whyus: "⭐ ¿Por Qué Elegirnos? (Empresa)",
  cta: "📞 Llamado a la Acción",
  footer: "📋 Footer",
};

export const DEFAULT_CONTENT: Record<SectionKey, SectionContent> = {
  hero: {
    subtitle: "Asesoría Microempresarial desde 2016",
    title: "Impulsamos el crecimiento de tu microempresa",
    description:
      "Servicios financieros, administrativos y de consultoría para pequeños empresarios en Norte de Santander.",
    highlight: "microempresa",
  },
  home_about: {
    subtitle: "Quiénes somos",
    title: "Asesoría Microempresarial S.A.S.",
    description:
      "Somos una sociedad comercial de economía privada, constituida conforme a las leyes de Colombia, dedicada a impulsar el crecimiento de la microempresa en Norte de Santander.\n\n" +
      "Nuestro equipo está conformado por profesionales con amplia trayectoria en el sector financiero y empresarial.",
    highlight: "",
  },
  about: {
    subtitle: "Quiénes somos",
    title: "Asesoría Microempresarial S.A.S.",
    description:
      "Somos una sociedad comercial de economía privada, constituida conforme a las leyes de la República de Colombia. Nuestro equipo está conformado por profesionales con amplia trayectoria en el sector financiero y empresarial.\n\n" +
      "Desde nuestra fundación hemos trabajado para democratizar el acceso a servicios de consultoría de calidad para pequeños y medianos empresarios de la región.",
    highlight: "",
  },
  services: {
    subtitle: "Lo que ofrecemos",
    title: "Servicios diseñados para tu negocio",
    description: "Soluciones financieras, administrativas y de consultoría para cada etapa de tu empresa.",
    highlight: "",
  },
  whyus: {
    subtitle: "¿Por qué elegirnos?",
    title: "Una empresa con propósito y valores sólidos",
    description:
      "Fundada bajo los principios de servicio, respeto y compromiso, Asesoría Microempresarial S.A.S. trabaja para ser el aliado estratégico de la microempresa colombiana, impulsando el crecimiento económico y social en Norte de Santander.",
    highlight: "",
  },
  cta: {
    subtitle: "¿Listo para empezar?",
    title: "Lleva tu empresa al siguiente nivel",
    description:
      "Nuestro equipo de asesores está disponible para atenderte y diseñar una estrategia personalizada para tu negocio.",
    highlight: "",
  },
  footer: {
    subtitle: "",
    title: "AME S.A.S. — Asesoría Microempresarial",
    description: "Todos los derechos reservados",
    highlight: "",
  },
};
