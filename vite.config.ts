import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { buildMetaTags, buildOrganizationJsonLd } from "./src/config/site.ts";
import { buildBreadcrumbJsonLd, notFoundMeta, pages, type PageMeta } from "./src/config/routes.ts";
import { buildHeadersFile, buildSecurityHeaders } from "./src/config/securityHeaders.ts";

const DEFAULT_SITE_URL = "http://localhost:8080";

// ---------------------------------------------------------------------------
// SEO: un HTML por ruta, 404.html, sitemap.xml y robots.txt
// ---------------------------------------------------------------------------
// Cada ruta de src/config/routes.ts recibe su propio HTML (empresa.html, contacto.html…) con
// título, description, canonical, Open Graph y datos estructurados en el <head>, para los
// rastreadores que no ejecutan JS (WhatsApp, Facebook). Cloudflare Pages sirve empresa.html en
// /empresa y 404.html, con estado 404, para las rutas que no existen. Las etiquetas llevan
// data-rh para que react-helmet-async (Seo) las reemplace al navegar dentro del sitio.

const SEO_START = "<!--seo:start-->";
const SEO_END = "<!--seo:end-->";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

function headFor(siteUrl: string, path: string, meta: PageMeta, preloads: string[]): string {
  const url = `${siteUrl}${path}`;
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(url)}" data-rh="true" />`,
    ...(meta.noindex ? [`<meta name="robots" content="noindex, nofollow" data-rh="true" />`] : []),
    ...buildMetaTags(siteUrl, { title: meta.title, description: meta.description, url }).map((tag) => {
      const [key, value] = "name" in tag ? ["name", tag.name] : ["property", tag.property];
      return `<meta ${key}="${escapeHtml(value)}" content="${escapeHtml(tag.content)}" data-rh="true" />`;
    }),
    ...preloads,
    `<script type="application/ld+json">${ldJson(buildOrganizationJsonLd(siteUrl))}</script>`,
  ];
  const breadcrumb = meta.noindex ? null : buildBreadcrumbJsonLd(siteUrl, path);
  if (breadcrumb) tags.push(`<script type="application/ld+json" data-rh="true">${ldJson(breadcrumb)}</script>`);
  return `${SEO_START}\n    ${tags.join("\n    ")}\n    ${SEO_END}`;
}

/** Archivo de salida de cada ruta: "/" → index.html, "/empresa" → empresa.html. */
const htmlFileFor = (path: string) => (path === "/" ? "index.html" : `${path.slice(1)}.html`);

function seoFiles(siteUrl: string): Plugin {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login

Sitemap: ${siteUrl}/sitemap.xml
`;
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = Object.entries(pages as Record<string, PageMeta>)
    .filter(([, meta]) => meta.sitemap && !meta.noindex)
    .map(
      ([path, meta]) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${meta.sitemap!.changefreq}</changefreq>
    <priority>${meta.sitemap!.priority}</priority>
  </url>`,
    )
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  let outDir = "dist";
  return {
    name: "seo-files",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    // En dev y en el build, index.html lleva el <head> de Inicio entre marcadores.
    transformIndexHtml(html) {
      return html.replace("</head>", `    ${headFor(siteUrl, "/", pages["/"], [])}\n  </head>`);
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
    },
    // Con el bundle escrito se conocen los nombres con hash de fuentes e imágenes a precargar.
    writeBundle(_options, bundle) {
      const files = Object.keys(bundle);
      const find = (pattern: RegExp) => files.find((f) => pattern.test(f));
      const fontPreloads = [/open-sans-latin-400-normal-[\w-]+\.woff2$/, /open-sans-latin-600-normal-[\w-]+\.woff2$/]
        .map(find)
        .filter((f): f is string => !!f)
        .map((f) => `<link rel="preload" href="/${f}" as="font" type="font/woff2" crossorigin />`);
      // Primera foto del hero (LCP de Inicio): el navegador la pide antes de ejecutar el JS.
      const hero640 = find(/hero-consulting-640-[\w-]+\.webp$/);
      const hero1280 = find(/hero-consulting-1280-[\w-]+\.webp$/);
      const heroPreload =
        hero640 && hero1280
          ? [
              `<link rel="preload" as="image" type="image/webp" fetchpriority="high" imagesrcset="/${hero640} 640w, /${hero1280} 1280w" imagesizes="100vw" />`,
            ]
          : [];

      const template = readFileSync(path.join(outDir, "index.html"), "utf8");
      const block = new RegExp(`${SEO_START}[\\s\\S]*?${SEO_END}`);
      const write = (file: string, head: string) =>
        writeFileSync(path.join(outDir, file), template.replace(block, head));

      for (const [route, meta] of Object.entries(pages as Record<string, PageMeta>)) {
        const preloads = route === "/" ? [...fontPreloads, ...heroPreload] : fontPreloads;
        write(htmlFileFor(route), headFor(siteUrl, route, meta, preloads));
      }
      write("404.html", headFor(siteUrl, "/404", notFoundMeta, fontPreloads));
    },
    // `vite preview` sirve los HTML como Cloudflare Pages: /empresa → empresa.html y las rutas
    // desconocidas → 404.html con estado 404.
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        if (req.method !== "GET" || url.pathname === "/" || path.extname(url.pathname)) return next();
        const file = htmlFileFor(url.pathname.replace(/\/+$/, ""));
        if (existsSync(path.join(outDir, file))) {
          req.url = `/${file}${url.search}`;
          return next();
        }
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(readFileSync(path.join(outDir, "404.html")));
      });
    },
  };
}

// Cabeceras de seguridad: dist/_headers para Cloudflare Pages y las mismas en `vite preview`.
// En `vite dev` no se aplican: el servidor de desarrollo usa scripts en línea (HMR).
function securityHeaders(supabaseUrl: string): Plugin {
  return {
    name: "security-headers",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "_headers", source: buildHeadersFile(supabaseUrl) });
    },
    configurePreviewServer(server) {
      const headers = buildSecurityHeaders(supabaseUrl);
      server.middlewares.use((_req, res, next) => {
        for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
        next();
      });
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
  // La CSP solo permite este Supabase; sin él, el build no puede generar _headers.
  const supabaseUrl = env.VITE_SUPABASE_URL;
  if (!supabaseUrl && command === "build") {
    throw new Error("[vite] Falta VITE_SUPABASE_URL: se necesita para la Content-Security-Policy.");
  }
  if (!env.VITE_TURNSTILE_SITE_KEY && command === "build") {
    console.warn("\n[vite] VITE_TURNSTILE_SITE_KEY no está definida; se usa la clave de prueba de Turnstile.\n");
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), seoFiles(siteUrl), ...(supabaseUrl ? [securityHeaders(supabaseUrl)] : [])],
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
