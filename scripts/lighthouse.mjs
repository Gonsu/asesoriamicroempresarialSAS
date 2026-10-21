// Lighthouse (móvil y escritorio) sobre el build servido en http://localhost:4173.
// Escribe lighthouse/<forma>_<ruta>.json y lighthouse/resumen.md (también a $GITHUB_STEP_SUMMARY).
// Uso: node scripts/lighthouse.mjs   (lo usa el job "lighthouse" del CI; no bloquea)

import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const LIGHTHOUSE = "lighthouse@12.8.2";
const BASE = process.env.LH_BASE_URL ?? "http://localhost:4173";
const routes = ["/", "/empresa", "/servicios", "/reuniones", "/contacto", "/politica-de-datos", "/terminos"];
const categories = ["performance", "accessibility", "best-practices", "seo"];
const outDir = "lighthouse";
mkdirSync(outDir, { recursive: true });

const rows = [];
for (const formFactor of ["mobile", "desktop"]) {
  for (const route of routes) {
    const file = `${outDir}/${formFactor}${route.replace(/\//g, "_") || "_"}.json`;
    const args = [
      "--yes",
      LIGHTHOUSE,
      BASE + route,
      "--quiet",
      "--output=json",
      `--output-path=${file}`,
      `--only-categories=${categories.join(",")}`,
      "--chrome-flags=--headless=new --no-sandbox",
      ...(formFactor === "desktop" ? ["--preset=desktop"] : []),
    ];
    try {
      execFileSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
      const lhr = JSON.parse(readFileSync(file, "utf8"));
      const score = (c) => Math.round((lhr.categories[c]?.score ?? 0) * 100);
      rows.push({
        formFactor,
        route,
        ...Object.fromEntries(categories.map((c) => [c, score(c)])),
        lcp: lhr.audits["largest-contentful-paint"]?.displayValue ?? "",
        cls: lhr.audits["cumulative-layout-shift"]?.displayValue ?? "",
      });
    } catch (err) {
      rows.push({ formFactor, route, error: String(err).split("\n")[0] });
    }
  }
}

const header = "| Forma | Ruta | Rend. | Accesib. | Buenas prácticas | SEO | LCP | CLS |\n|---|---|---|---|---|---|---|---|";
const lines = rows.map((r) =>
  r.error
    ? `| ${r.formFactor} | ${r.route} | error: ${r.error} | | | | | |`
    : `| ${r.formFactor} | ${r.route} | ${r.performance} | ${r.accessibility} | ${r["best-practices"]} | ${r.seo} | ${r.lcp} | ${r.cls} |`,
);
const below = rows.filter((r) => !r.error && categories.some((c) => r[c] < 90)).length;
const markdown = [
  "## Lighthouse",
  "",
  `Build servido con \`vite preview\` (cabeceras reales) y Supabase local. Runner compartido de GitHub: el rendimiento varía entre corridas.`,
  "",
  header,
  ...lines,
  "",
  below ? `**${below} mediciones con alguna categoría por debajo de 90.**` : "Todas las categorías en 90 o más.",
  "",
].join("\n");

writeFileSync(`${outDir}/resumen.md`, markdown);
writeFileSync(`${outDir}/resumen.json`, JSON.stringify(rows, null, 2));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(markdown);
