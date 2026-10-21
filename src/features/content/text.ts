/** Divide un texto en párrafos separados por una línea en blanco. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Parte el título alrededor de la primera aparición de la palabra resaltada.
 * Devuelve null si no hay palabra o si no aparece en el título: entonces no se resalta nada.
 */
export function splitHighlight(
  title: string,
  highlight: string,
): { before: string; match: string; after: string } | null {
  const word = highlight.trim();
  if (!word) return null;
  const index = title.indexOf(word);
  if (index === -1) return null;
  return {
    before: title.slice(0, index),
    match: word,
    after: title.slice(index + word.length),
  };
}
