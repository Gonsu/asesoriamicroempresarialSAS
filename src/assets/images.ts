// Imágenes optimizadas (WebP), generadas con `npm run images` desde assets-originales/.
// Cada una trae src, srcSet, width y height para el <img>: el navegador reserva su espacio
// (sin saltos de contenido) y elige el ancho según la pantalla.

import heroConsulting640 from "./hero-consulting-640.webp";
import heroConsulting1280 from "./hero-consulting-1280.webp";
import heroEntrepreneur640 from "./hero-entrepreneur-640.webp";
import heroEntrepreneur1280 from "./hero-entrepreneur-1280.webp";
import heroTeam640 from "./hero-team-640.webp";
import heroTeam1280 from "./hero-team-1280.webp";
import serviceFinancial480 from "./service-financial-480.webp";
import serviceFinancial800 from "./service-financial-800.webp";
import serviceAdmin480 from "./service-admin-480.webp";
import serviceAdmin800 from "./service-admin-800.webp";
import serviceConsulting480 from "./service-consulting-480.webp";
import serviceConsulting800 from "./service-consulting-800.webp";
import cucuta400 from "./cucuta-400.webp";
import cucuta700 from "./cucuta-700.webp";
import logoAme from "./logo-ame.webp";

export interface ResponsiveImage {
  src: string;
  srcSet: string;
  width: number;
  height: number;
}

const responsive = (small: [string, number], large: [string, number], ratio: number): ResponsiveImage => ({
  src: large[0],
  srcSet: `${small[0]} ${small[1]}w, ${large[0]} ${large[1]}w`,
  width: large[1],
  height: Math.round(large[1] / ratio),
});

export const heroImages = [
  responsive([heroConsulting640, 640], [heroConsulting1280, 1280], 16 / 9),
  responsive([heroEntrepreneur640, 640], [heroEntrepreneur1280, 1280], 16 / 9),
  responsive([heroTeam640, 640], [heroTeam1280, 1280], 16 / 9),
];

export const serviceImages = {
  financial: responsive([serviceFinancial480, 480], [serviceFinancial800, 800], 4 / 3),
  admin: responsive([serviceAdmin480, 480], [serviceAdmin800, 800], 4 / 3),
  consulting: responsive([serviceConsulting480, 480], [serviceConsulting800, 800], 4 / 3),
};

export const cucutaImage: ResponsiveImage = {
  src: cucuta700,
  srcSet: `${cucuta400} 400w, ${cucuta700} 700w`,
  width: 700,
  height: 400,
};

export const logoImage = { src: logoAme, width: 318, height: 95 };
