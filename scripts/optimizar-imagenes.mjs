// Genera las imágenes del sitio a partir de assets-originales/:
//   - src/assets/*.webp en los anchos que usa cada componente (ver src/assets/images.ts);
//   - public/og-image.jpg (1200×630) para Open Graph, compuesta con el logo y textos.
// Uso: npm run images   (los archivos generados se versionan; solo hace falta al cambiar fotos)

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = (name) => join(root, "assets-originales", name);
const out = (name) => join(root, "src", "assets", name);

/** [archivo original, nombre de salida, anchos] */
const photos = [
  ["hero-consulting.jpg", "hero-consulting", [640, 1280]],
  ["hero-entrepreneur.jpg", "hero-entrepreneur", [640, 1280]],
  ["hero-team.jpg", "hero-team", [640, 1280]],
  ["service-financial.jpg", "service-financial", [480, 800]],
  ["service-admin.jpg", "service-admin", [480, 800]],
  ["service-consulting.jpg", "service-consulting", [480, 800]],
  ["cucuta-real.png", "cucuta", [400, 700]],
];

mkdirSync(join(root, "src", "assets"), { recursive: true });

for (const [file, name, widths] of photos) {
  for (const width of widths) {
    const info = await sharp(src(file))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(out(`${name}-${width}.webp`));
    console.log(`${name}-${width}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
  }
}

// Logo: se muestra a 36–48 px de alto; 2x de 48 px de alto ≈ 320 px de ancho (su tamaño original).
const logo = await sharp(src("logo-ame.png")).webp({ quality: 90, effort: 6 }).toFile(out("logo-ame.webp"));
console.log(`logo-ame.webp  ${logo.width}x${logo.height}  ${(logo.size / 1024).toFixed(1)} KB`);

// ---------------------------------------------------------------------------
// Imagen Open Graph: fondo oscuro de la marca, logo y dos líneas de texto.
// ---------------------------------------------------------------------------
const W = 1200;
const H = 630;
const dark = "#1b2531"; // --dark (214 30% 15%)
const darker = "#0f1824"; // --dark-surface
const green = "#1b6a42"; // --primary
const greenLight = "#5DCAA5";

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const title = "Asesoría Microempresarial S.A.S.";
const subtitle = ["Servicios financieros y administrativos", "para microempresas en Cúcuta"];
const font = "Open Sans, Segoe UI, Arial, sans-serif";

const background = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${dark}"/>
      <stop offset="1" stop-color="${darker}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="${W - 60}" cy="70" r="260" fill="${green}" opacity="0.18"/>
  <circle cx="${W - 10}" cy="${H + 40}" r="200" fill="${greenLight}" opacity="0.08"/>
  <rect x="80" y="104" width="380" height="140" rx="18" fill="#ffffff"/>
  <rect x="80" y="300" width="96" height="8" rx="4" fill="${greenLight}"/>
  <text x="80" y="388" font-family="${font}" font-size="58" font-weight="700" fill="#ffffff">${escape(title)}</text>
  <text x="80" y="460" font-family="${font}" font-size="36" font-weight="400" fill="#d5dde6">${escape(subtitle[0])}</text>
  <text x="80" y="508" font-family="${font}" font-size="36" font-weight="400" fill="#d5dde6">${escape(subtitle[1])}</text>
</svg>`);

const logoForOg = await sharp(src("logo-ame.png")).resize({ width: 340 }).png().toBuffer();
const logoMeta = await sharp(logoForOg).metadata();
const og = await sharp(background)
  .composite([{ input: logoForOg, left: 80 + Math.round((380 - logoMeta.width) / 2), top: 104 + Math.round((140 - logoMeta.height) / 2) }])
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(join(root, "public", "og-image.jpg"));
console.log(`og-image.jpg  ${og.width}x${og.height}  ${(og.size / 1024).toFixed(1)} KB`);
