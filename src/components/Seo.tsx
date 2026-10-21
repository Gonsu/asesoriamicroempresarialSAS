import { Helmet } from "react-helmet-async";
import { buildMetaTags, site } from "@/config/site";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const Seo = ({ title, description, path, noindex, jsonLd }: SeoProps) => {
  const url = `${site.url}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {buildMetaTags(site.url, { title, description, url }).map((tag) => (
        <meta key={"name" in tag ? tag.name : tag.property} {...tag} />
      ))}
      {/* Helmet escribe el texto tal cual dentro de <script>: se escapa "<" para que un valor
          con "</script>" no pueda cerrar la etiqueta. */}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>}
    </Helmet>
  );
};

export default Seo;
