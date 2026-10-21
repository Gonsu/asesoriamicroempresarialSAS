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
