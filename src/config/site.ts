// Datos de la empresa y del sitio. Fuente única para enlaces de contacto, SEO y JSON-LD.

const phoneDigits = "3168308779";

export const site = {
  name: "Asesoría Microempresarial S.A.S.",
  shortName: "AME S.A.S.",
  foundingYear: 2016,
  // URL pública sin barra final; vite.config.ts aplica un valor por defecto si falta.
  url: (import.meta.env.VITE_SITE_URL ?? "").replace(/\/+$/, ""),
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

// Datos estructurados (schema.org) de la empresa; se publican en la página de inicio.
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: `${site.name} (${site.shortName})`,
  url: `${site.url}/`,
  image: `${site.url}/og-image.png`,
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
};
