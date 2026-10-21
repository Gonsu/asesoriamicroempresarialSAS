import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_CONTENT, type SectionContent, type SectionKey } from "./defaults";
import { fetchSiteContent, saveSection } from "./service";

const contentKey = ["site_content"] as const;

export function useSiteContent() {
  return useQuery({ queryKey: contentKey, queryFn: fetchSiteContent, staleTime: 5 * 60 * 1000 });
}

/** Textos de una sección. Mientras carga, o si la consulta falla, devuelve los valores por defecto. */
export function useSection(key: SectionKey): SectionContent {
  const { data } = useSiteContent();
  return data?.[key] ?? DEFAULT_CONTENT[key];
}

export function useSaveSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, values }: { key: SectionKey; values: SectionContent }) => saveSection(key, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contentKey }),
  });
}
