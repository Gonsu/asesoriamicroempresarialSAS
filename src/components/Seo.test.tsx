import { render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import Seo from "@/components/Seo";
import { buildMetaTags, seoDefaults, site } from "@/config/site";

// Reproduce las etiquetas que vite.config.ts inserta en index.html.
const addDefaultHeadTags = () => {
  for (const attrs of buildMetaTags(site.url, seoDefaults)) {
    const meta = document.createElement("meta");
    for (const [key, value] of Object.entries(attrs)) meta.setAttribute(key, value);
    meta.setAttribute("data-rh", "true");
    document.head.appendChild(meta);
  }
};

const contentOf = (selector: string) =>
  Array.from(document.head.querySelectorAll(selector)).map((el) => el.getAttribute("content"));

describe("Seo", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    addDefaultHeadTags();
  });

  it("reemplaza las etiquetas por defecto de index.html sin duplicarlas", async () => {
    render(
      <HelmetProvider>
        <Seo title="Servicios | AME" description="Descripción de servicios" path="/servicios" />
      </HelmetProvider>,
    );

    await waitFor(() => expect(document.title).toBe("Servicios | AME"));
    expect(contentOf('meta[property="og:title"]')).toEqual(["Servicios | AME"]);
    expect(contentOf('meta[name="twitter:title"]')).toEqual(["Servicios | AME"]);
    expect(contentOf('meta[name="description"]')).toEqual(["Descripción de servicios"]);
    expect(contentOf('meta[property="og:url"]')).toEqual([`${site.url}/servicios`]);
    // Las etiquetas que la página no cambia se conservan.
    expect(contentOf('meta[property="og:image"]')).toEqual([`${site.url}${seoDefaults.image.path}`]);
    expect(contentOf('meta[name="twitter:card"]')).toEqual(["summary_large_image"]);
  });

  it("escapa el JSON-LD para que un valor no pueda cerrar la etiqueta <script>", async () => {
    const name = "</script><img src=x onerror=alert(1)>";
    render(
      <HelmetProvider>
        <Seo title="T" description="D" path="/" jsonLd={{ name }} />
      </HelmetProvider>,
    );

    const script = await waitFor(() => {
      const el = document.head.querySelector('script[type="application/ld+json"]');
      expect(el).not.toBeNull();
      return el as HTMLScriptElement;
    });
    expect(script.textContent).not.toContain("</script>");
    expect(JSON.parse(script.textContent ?? "")).toEqual({ name });
    expect(document.head.querySelector("img")).toBeNull();
  });
});
