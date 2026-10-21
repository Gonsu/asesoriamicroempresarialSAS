import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_CONTENT, SECTION_KEYS } from "./defaults";
import { mergeContent } from "./service";
import { paragraphs, splitHighlight } from "./text";

/** Literal SQL como está escrito en seed.sql: E'...' si tiene saltos de línea. */
const sqlLiteral = (value: string) => {
  const quoted = value.replace(/'/g, "''");
  return value.includes("\n") ? `E'${quoted.replace(/\n/g, "\\n")}'` : `'${quoted}'`;
};

describe("seed.sql", () => {
  const seed = readFileSync(resolve(__dirname, "../../../supabase/seed.sql"), "utf8");

  it.each(SECTION_KEYS)("tiene los textos por defecto de %s", (key) => {
    const { title, subtitle, description, highlight } = DEFAULT_CONTENT[key];
    expect(seed).toContain(`('${key}',`);
    for (const value of [title, subtitle, description].filter(Boolean)) {
      expect(seed).toContain(sqlLiteral(value));
    }
    if (highlight) expect(seed).toContain(`'{"highlight": "${highlight}"}'`);
  });
});

describe("mergeContent", () => {
  const row = { title: null, subtitle: null, description: null, extra_data: {} };

  it("usa los valores por defecto sin filas", () => {
    expect(mergeContent([])).toEqual(DEFAULT_CONTENT);
  });

  it("usa la base de datos y completa los campos vacíos", () => {
    const content = mergeContent([{ ...row, section_key: "cta", title: "Nuevo título", description: "  " }]);
    expect(content.cta.title).toBe("Nuevo título");
    expect(content.cta.description).toBe(DEFAULT_CONTENT.cta.description);
    expect(content.cta.subtitle).toBe(DEFAULT_CONTENT.cta.subtitle);
  });

  it("lee la palabra resaltada de extra_data y respeta la cadena vacía", () => {
    expect(mergeContent([{ ...row, section_key: "hero", extra_data: { highlight: "tu" } }]).hero.highlight).toBe("tu");
    expect(mergeContent([{ ...row, section_key: "hero", extra_data: { highlight: "" } }]).hero.highlight).toBe("");
    expect(mergeContent([{ ...row, section_key: "hero" }]).hero.highlight).toBe("microempresa");
  });

  it("ignora secciones desconocidas", () => {
    expect(mergeContent([{ ...row, section_key: "otra", title: "x" }])).toEqual(DEFAULT_CONTENT);
  });
});

describe("text", () => {
  it("separa párrafos por línea en blanco", () => {
    expect(paragraphs("Uno.\n\nDos.\n  \nTres.")).toEqual(["Uno.", "Dos.", "Tres."]);
    expect(paragraphs("Una línea\ncon salto")).toEqual(["Una línea\ncon salto"]);
  });

  it("resalta solo si la palabra aparece en el título", () => {
    expect(splitHighlight("Impulsamos tu microempresa hoy", "microempresa")).toEqual({
      before: "Impulsamos tu ",
      match: "microempresa",
      after: " hoy",
    });
    expect(splitHighlight("Impulsamos tu negocio", "microempresa")).toBeNull();
    expect(splitHighlight("Impulsamos tu negocio", "  ")).toBeNull();
  });
});
