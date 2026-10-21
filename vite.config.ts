import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { buildMetaTags, buildOrganizationJsonLd, seoDefaults } from "./src/config/site.ts";

const DEFAULT_SITE_URL = "http://localhost:8080";

// Rutas públicas indexables; se publican en sitemap.xml.
const sitemapRoutes = [
  { path: "/", changefreq: "monthly", priority: "1.0" },
  { path: "/empresa", changefreq: "monthly", priority: "0.8" },
  { path: "/servicios", changefreq: "monthly", priority: "0.9" },
  { path: "/reuniones", changefreq: "weekly", priority: "0.8" },
  { path: "/contacto", changefreq: "yearly", priority: "0.7" },
];

// Inserta en index.html el título, las etiquetas description/og:/twitter: y el JSON-LD por
// defecto, para los rastreadores que no ejecutan JS (WhatsApp, Facebook). Las etiquetas meta
// llevan data-rh para que react-helmet-async (Seo) las reemplace en cada página.
function seoHtmlTags(siteUrl: string): HtmlTagDescriptor[] {
  const jsonLd = JSON.stringify(buildOrganizationJsonLd(siteUrl), null, 2).replace(/</g, "\\u003c");
  return [
    { tag: "title", children: seoDefaults.title, injectTo: "head" },
    ...buildMetaTags(siteUrl, seoDefaults).map(
      (attrs): HtmlTagDescriptor => ({ tag: "meta", attrs: { ...attrs, "data-rh": "true" }, injectTo: "head" }),
    ),
    { tag: "script", attrs: { type: "application/ld+json" }, children: jsonLd, injectTo: "head" },
  ];
}

// Genera las etiquetas SEO de index.html y, en el build, robots.txt y sitemap.xml.
function seoFiles(siteUrl: string): Plugin {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login

Sitemap: ${siteUrl}/sitemap.xml
`;
  const urls = sitemapRoutes
    .map(
      (r) => `  <url>
    <loc>${siteUrl}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
    )
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return {
    name: "seo-files",
    transformIndexHtml() {
      return seoHtmlTags(siteUrl);
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  if (!env.VITE_SITE_URL && command === "build") {
    console.warn(`\n[vite] VITE_SITE_URL no está definida; se usa ${DEFAULT_SITE_URL}.\n`);
  }
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
  // Expone el valor normalizado a import.meta.env y a %VITE_SITE_URL% en index.html.
  process.env.VITE_SITE_URL = siteUrl;

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), seoFiles(siteUrl)],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
    build: {
      rolldownOptions: {
        output: {
          // Librerías que cambian poco en chunks propios: siguen en caché entre despliegues.
          codeSplitting: {
            groups: [
              { name: "react", test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
              { name: "supabase", test: /node_modules[\\/]@supabase[\\/]/ },
            ],
          },
        },
      },
    },
  };
});
