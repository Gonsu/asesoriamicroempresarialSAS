// Metadatos de cada ruta. Fuente única para:
//   - las páginas (componente Seo, con react-helmet-async);
//   - el build (vite.config.ts): un HTML por ruta con su título, descripción, canonical, Open
//     Graph y datos estructurados, para rastreadores que no ejecutan JS (WhatsApp, Facebook),
//     y el sitemap.
// Como site.ts, no usa alias "@/" porque lo importa vite.config.ts (Node).
import { site } from "./site.ts";

export interface PageMeta {
  title: string;
  description: string;
  /** Nombre corto para las migas de pan (BreadcrumbList). Inicio no lleva. */
  breadcrumb?: string;
  /** Fuera de buscadores y del sitemap. */
  noindex?: boolean;
  sitemap?: { changefreq: "weekly" | "monthly" | "yearly"; priority: string };
}

export const pages = {
  "/": {
    title: "Asesoría empresarial para microempresas en Cúcuta | AME S.A.S.",
    description:
      "AME S.A.S. brinda asesoría financiera, gestión administrativa y consultoría empresarial para microempresas en Cúcuta y Norte de Santander.",
    sitemap: { changefreq: "monthly", priority: "1.0" },
  },
  "/empresa": {
    title: "Quiénes somos: asesoría microempresarial desde 2016 | AME S.A.S.",
    description:
      "Conoce a AME S.A.S.: misión, visión, valores y objetivos de nuestra asesoría microempresarial en Cúcuta, Norte de Santander, desde 2016.",
    breadcrumb: "Empresa",
    sitemap: { changefreq: "monthly", priority: "0.8" },
  },
  "/servicios": {
    title: "Asesoría financiera, administrativa y consultoría | AME S.A.S.",
    description:
      "Servicios de asesoría financiera, gestión administrativa y consultoría empresarial para microempresas en Cúcuta y Norte de Santander.",
    breadcrumb: "Servicios",
    sitemap: { changefreq: "monthly", priority: "0.9" },
  },
  "/reuniones": {
    title: "Reuniones y sesiones de asesoría empresarial | AME S.A.S.",
    description:
      "Reuniones, asesorías y actividades de AME S.A.S. con microempresarios de Cúcuta y Norte de Santander, y testimonios de nuestros clientes.",
    breadcrumb: "Reuniones",
    sitemap: { changefreq: "weekly", priority: "0.7" },
  },
  "/contacto": {
    title: "Contacto y ubicación en Barrio Lleras, Cúcuta | AME S.A.S.",
    description: `Contáctanos: ${site.address.street}, ${site.address.neighborhood}, ${site.address.city}. WhatsApp +57 ${site.phone.display} y correo ${site.email}.`,
    breadcrumb: "Contacto",
    sitemap: { changefreq: "yearly", priority: "0.7" },
  },
  "/politica-de-datos": {
    title: "Política de tratamiento de datos personales | AME S.A.S.",
    description:
      "Cómo AME S.A.S. recolecta, usa, conserva y protege tus datos personales, y cómo ejercer tus derechos según la Ley 1581 de 2012.",
    breadcrumb: "Política de datos",
    sitemap: { changefreq: "yearly", priority: "0.3" },
  },
  "/terminos": {
    title: "Términos de uso | AME S.A.S.",
    description: "Condiciones de uso del sitio web de AME S.A.S. — Asesoría Microempresarial.",
    breadcrumb: "Términos de uso",
    sitemap: { changefreq: "yearly", priority: "0.3" },
  },
  "/login": {
    title: "Acceso administrativo | AME S.A.S.",
    description: "Acceso restringido al panel administrativo de AME S.A.S.",
    noindex: true,
  },
  "/admin": {
    title: "Panel administrativo | AME S.A.S.",
    description: "Panel administrativo de AME S.A.S.",
    noindex: true,
  },
} satisfies Record<string, PageMeta>;

export type PagePath = keyof typeof pages;

export const notFoundMeta: PageMeta = {
  title: "Página no encontrada | AME S.A.S.",
  description: "La página que buscas no existe en el sitio de AME S.A.S.",
  noindex: true,
};

/** Migas de pan (schema.org) de una ruta interna; null para Inicio o rutas sin nombre. */
export function buildBreadcrumbJsonLd(siteUrl: string, path: string) {
  const meta = (pages as Record<string, PageMeta>)[path];
  if (!meta?.breadcrumb) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: meta.breadcrumb, item: `${siteUrl}${path}` },
    ],
  };
}
