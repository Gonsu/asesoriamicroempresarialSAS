import { getSupabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import { DEFAULT_CONTENT, SECTION_KEYS, type SectionContent, type SectionKey } from "./defaults";

export type SiteContentRow = Pick<
  Tables<"site_content">,
  "section_key" | "title" | "subtitle" | "description" | "extra_data"
>;

export type SiteContent = Record<SectionKey, SectionContent>;

const isSectionKey = (key: string): key is SectionKey => (SECTION_KEYS as readonly string[]).includes(key);

function readHighlight(extra: Json): string | null {
  if (extra && typeof extra === "object" && !Array.isArray(extra) && typeof extra.highlight === "string") {
    return extra.highlight;
  }
  return null;
}

/**
 * Combina las filas de la base de datos con los textos por defecto. Un campo vacío o una
 * sección que no existe en la tabla usan el valor por defecto. En highlight, una cadena
 * vacía guardada a propósito sí se respeta (sin resaltado).
 */
export function mergeContent(rows: SiteContentRow[]): SiteContent {
  const content = Object.fromEntries(
    SECTION_KEYS.map((key) => [key, { ...DEFAULT_CONTENT[key] }]),
  ) as SiteContent;

  for (const row of rows) {
    if (!isSectionKey(row.section_key)) continue;
    const fallback = DEFAULT_CONTENT[row.section_key];
    content[row.section_key] = {
      title: row.title?.trim() || fallback.title,
      subtitle: row.subtitle?.trim() || fallback.subtitle,
      description: row.description?.trim() || fallback.description,
      highlight: readHighlight(row.extra_data) ?? fallback.highlight,
    };
  }
  return content;
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("site_content")
    .select("section_key, title, subtitle, description, extra_data");
  if (error) throw new Error(`No se pudo cargar el contenido: ${error.message}`);
  return mergeContent(data);
}

/** Crea o actualiza una sección. extra_data solo se escribe en el hero (palabra resaltada). */
export async function saveSection(key: SectionKey, values: SectionContent): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("site_content").upsert(
    {
      section_key: key,
      title: values.title,
      subtitle: values.subtitle || null,
      description: values.description,
      ...(key === "hero" && { extra_data: { highlight: values.highlight } }),
    },
    { onConflict: "section_key" },
  );
  if (error) throw new Error(`No se pudo guardar la sección: ${error.message}`);
}
