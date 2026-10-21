import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const DEFAULT_SITE_URL = "http://localhost:8080";

// Rutas públicas indexables; se publican en sitemap.xml.
const sitemapRoutes = [
  { path: "/", changefreq: "monthly", priority: "1.0" },
  { path: "/empresa", changefreq: "monthly", priority: "0.8" },
  { path: "/servicios", changefreq: "monthly", priority: "0.9" },
  { path: "/reuniones", changefreq: "weekly", priority: "0.8" },
  { path: "/contacto", changefreq: "yearly", priority: "0.7" },
];

// Genera robots.txt y sitemap.xml en dist/ con la URL del sitio.
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
    apply: "build",
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
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
