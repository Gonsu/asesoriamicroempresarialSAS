// Datos de la empresa y del sitio. Fuente única para enlaces de contacto, SEO y JSON-LD.
// También lo importa vite.config.ts (Node) para generar las etiquetas de index.html,
// por eso no usa alias "@/" y las funciones de SEO reciben la URL del sitio como argumento.

const phoneDigits = "3168308779";

export const site = {
  name: "Asesoría Microempresarial S.A.S.",
  shortName: "AME S.A.S.",
  foundingYear: 2016,
  // URL pública sin barra final; vite.config.ts aplica un valor por defecto si falta.
  // En Node (vite.config.ts) import.meta.env no existe y queda vacía.
  url: (import.meta.env?.VITE_SITE_URL ?? "").replace(/\/+$/, ""),
  phone: {
    display: "316 830 8779",
    e164: `+57${phoneDigits}`,
  },
  whatsappUrl: `https://wa.me/57${phoneDigits}`,
  email: "asesoriamsas@gmail.com",
  address: {
    street: "Cll. 5 No. OA-114 2° Piso",
    neighborhood: "Barrio Lleras",
    city: "Cúcuta",
    region: "Norte de Santander",
    country: "CO",
    mapsUrl: "https://maps.app.goo.gl/K4ZsyQxgMnRXskWL8",
    geo: { latitude: 7.8928, longitude: -72.5004 },
  },
  social: {
    facebook: "https://www.facebook.com/profile.php?id=100090527183922",
    instagram: "https://www.instagram.com/asesoriamsas/",
  },
} as const;

export const mailtoUrl = `mailto:${site.email}`;

// Valores por defecto de título, descripción e imagen para compartir (Open Graph / Twitter).
export const seoDefaults = {
  title: `${site.shortName} — Asesoría Microempresarial`,
  description:
    "Servicios financieros y administrativos para microempresas en Cúcuta, Colombia. Asesoría, gestión y consultoría empresarial.",
  locale: "es_CO",
  image: { path: "/og-image.jpg", width: 1200, height: 630, alt: `${site.shortName} — Asesoría Microempresarial` },
} as const;

export type MetaTag = { name: string; content: string } | { property: string; content: string };

interface MetaTagOptions {
  title: string;
  description: string;
  url?: string;
}

// Etiquetas description, og:* y twitter:*. Las usan index.html (vía vite.config.ts) y Seo,
// que deben producir el mismo conjunto para que react-helmet-async reemplace las del HTML.
export const buildMetaTags = (siteUrl: string, { title, description, url }: MetaTagOptions): MetaTag[] => {
  const image = `${siteUrl}${seoDefaults.image.path}`;
  return [
    { name: "description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: site.shortName },
    { property: "og:locale", content: seoDefaults.locale },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    ...(url ? [{ property: "og:url", content: url }] : []),
    { property: "og:image", content: image },
    { property: "og:image:width", content: String(seoDefaults.image.width) },
    { property: "og:image:height", content: String(seoDefaults.image.height) },
    { property: "og:image:alt", content: seoDefaults.image.alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
};

// Datos estructurados (schema.org) de la empresa; vite.config.ts los inserta en index.html.
export const buildOrganizationJsonLd = (siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: `${site.name} (${site.shortName})`,
  url: `${siteUrl}/`,
  image: `${siteUrl}${seoDefaults.image.path}`,
  description:
    "Asesoría financiera, gestión administrativa y consultoría empresarial para microempresas en Cúcuta y Norte de Santander.",
  telephone: site.phone.e164,
  email: site.email,
  foundingDate: String(site.foundingYear),
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.address.street}, ${site.address.neighborhood}`,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  },
  geo: { "@type": "GeoCoordinates", ...site.address.geo },
  areaServed: { "@type": "AdministrativeArea", name: site.address.region },
  sameAs: [site.social.facebook, site.social.instagram],
});
