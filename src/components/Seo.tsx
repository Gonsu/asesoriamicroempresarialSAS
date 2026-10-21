import { Helmet } from "react-helmet-async";
import { buildMetaTags, site } from "@/config/site";
import { buildBreadcrumbJsonLd, pages, type PageMeta } from "@/config/routes";

interface SeoProps {
  path: string;
  /** Por defecto, los de src/config/routes.ts para esta ruta. */
  title?: string;
  description?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

/** Escapa "<": Helmet escribe el texto tal cual dentro de <script> y un "</script>" lo cerraría. */
const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

const Seo = ({ path, title, description, noindex, jsonLd }: SeoProps) => {
  const meta = (pages as Record<string, PageMeta>)[path];
  const finalTitle = title ?? meta?.title ?? site.shortName;
  const finalDescription = description ?? meta?.description ?? "";
  const hidden = noindex ?? meta?.noindex ?? false;
  const url = `${site.url}${path}`;
  const breadcrumb = hidden ? null : buildBreadcrumbJsonLd(site.url, path);

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <link rel="canonical" href={url} />
      {hidden && <meta name="robots" content="noindex, nofollow" />}
      {buildMetaTags(site.url, { title: finalTitle, description: finalDescription, url }).map((tag) => (
        <meta key={"name" in tag ? tag.name : tag.property} {...tag} />
      ))}
      {breadcrumb && <script type="application/ld+json">{ldJson(breadcrumb)}</script>}
      {jsonLd && <script type="application/ld+json">{ldJson(jsonLd)}</script>}
    </Helmet>
  );
};

export default Seo;
