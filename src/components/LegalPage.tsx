import type { ReactNode } from "react";

/** Estructura común de las páginas legales: cabecera como las demás páginas y texto legible. */
export const LegalPage = ({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: ReactNode; children: ReactNode }) => (
  <>
    <section className="bg-ame-dark py-16 px-6 md:px-8 text-center">
      <span className="text-sm font-semibold text-[#5DCAA5]">{eyebrow}</span>
      <h1 className="text-3xl md:text-4xl font-semibold text-primary-foreground mt-3 mb-4">{title}</h1>
      <p className="text-primary-foreground/70 max-w-2xl mx-auto text-base">{intro}</p>
    </section>
    <article className="section-padding px-6 md:px-8 bg-background">
      <div className="max-w-3xl mx-auto space-y-10 text-[15px] leading-relaxed text-foreground">{children}</div>
    </article>
  </>
);

export const LegalSection = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <section id={id} aria-labelledby={`${id}-titulo`} className="space-y-3">
    <h2 id={`${id}-titulo`} className="text-xl font-semibold text-foreground">
      {title}
    </h2>
    {children}
  </section>
);

export const LegalList = ({ children }: { children: ReactNode }) => (
  <ul className="list-disc pl-6 space-y-1.5 marker:text-primary">{children}</ul>
);

/** Tabla simple con encabezados; en móvil se desplaza horizontalmente. */
export const LegalTable = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <div className="overflow-x-auto rounded-lg border border-border">
    <table className="w-full text-sm">
      <thead className="bg-muted/60 text-left">
        <tr>
          {head.map((h) => (
            <th key={h} scope="col" className="px-3 py-2 font-semibold align-bottom">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((cells, i) => (
          <tr key={i} className="border-t border-border align-top">
            {cells.map((c, j) => (
              <td key={j} className="px-3 py-2">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Marca visible para los datos que la empresa debe completar. */
export const Pending = ({ children }: { children: ReactNode }) => (
  <mark className="bg-amber-100 text-amber-900 px-1 rounded">{children}</mark>
);

/** Muestra un dato de config/legal.ts; si aún dice [COMPLETAR], lo resalta. */
export const Fill = ({ value }: { value: string }) =>
  value.startsWith("[COMPLETAR") ? <Pending>{value}</Pending> : <>{value}</>;
