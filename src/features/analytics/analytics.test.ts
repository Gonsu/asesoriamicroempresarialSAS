import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { isBotUserAgent } from "./bots";
import { toCsv } from "./csv";
import { monthLabel, monthsInPeriod, periodLabel, periodRange, yearOptions } from "./period";
import { reportFilename, statsReportRows } from "./report";

const insertPageView = vi.fn();
vi.mock("./service", () => ({ insertPageView: (...args: unknown[]) => insertPageView(...args) }));
const { sanitizePage, trackPageView } = await import("./tracking");

const CHROME =
  "Mozilla/5.0 (Linux; Android 14; CUBOT X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36";

describe("bots", () => {
  it.each([
    "WhatsApp/2.23.20.0 A",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "TelegramBot (like TwitterBot)",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/120.0",
  ])("detecta %s", (ua) => {
    expect(isBotUserAgent(ua)).toBe(true);
  });

  it.each([
    CHROME,
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 [FBAN/FBIOS;FBAV/440.0]",
    "",
    null,
  ])("no marca como bot a %s", (ua) => {
    expect(isBotUserAgent(ua)).toBe(false);
  });

  it("usa la misma expresión que la migración SQL", () => {
    const sql = readFileSync(resolve(__dirname, "../../../supabase/migrations/20261021000000_estadisticas.sql"), "utf8");
    const source = readFileSync(resolve(__dirname, "bots.ts"), "utf8");
    const sqlPattern = sql.match(/p_user_agent ~\* '([^']+)'/)?.[1];
    const tsPattern = source.match(/\/(\(.+\))\/i;/)?.[1].replace(/\\\//g, "/");
    expect(sqlPattern).toBeDefined();
    expect(tsPattern).toBe(sqlPattern);
  });
});

describe("period", () => {
  it("calcula el rango de un mes, incluido febrero bisiesto", () => {
    expect(periodRange({ kind: "month", year: 2026, month: 10 })).toEqual({ desde: "2026-10-01", hasta: "2026-10-31" });
    expect(periodRange({ kind: "month", year: 2028, month: 2 })).toEqual({ desde: "2028-02-01", hasta: "2028-02-29" });
  });

  it("calcula el rango y los meses de un año", () => {
    expect(periodRange({ kind: "year", year: 2026 })).toEqual({ desde: "2026-01-01", hasta: "2026-12-31" });
    const months = monthsInPeriod({ kind: "year", year: 2026 });
    expect(months).toHaveLength(12);
    expect(months[0]).toBe("2026-01-01");
    expect(months[11]).toBe("2026-12-01");
  });

  it("formatea etiquetas", () => {
    expect(periodLabel({ kind: "month", year: 2026, month: 4 })).toBe("abril de 2026");
    expect(periodLabel({ kind: "year", year: 2026 })).toBe("2026");
    expect(monthLabel("2026-10-01")).toBe("oct 2026");
  });

  it("ofrece años desde el actual hasta el primero con datos", () => {
    expect(yearOptions(new Date(2028, 0, 1))).toEqual([2028, 2027, 2026]);
    expect(yearOptions(new Date(2026, 5, 1))).toEqual([2026]);
  });
});

describe("csv", () => {
  it("usa BOM, separador ; y CRLF", () => {
    expect(toCsv([["Mes", "Visitas"], ["oct 2026", 12]])).toBe("﻿Mes;Visitas\r\noct 2026;12\r\n");
  });

  it("entrecomilla y escapa los campos con ; comillas o saltos", () => {
    expect(toCsv([['Dijo "hola"; adiós', "a\nb"]])).toBe('﻿"Dijo ""hola""; adiós";"a\nb"\r\n');
  });

  it("neutraliza textos que Excel tomaría como fórmula", () => {
    expect(toCsv([["=HYPERLINK(1)", "-5", "+1", "@x"]])).toBe("﻿'=HYPERLINK(1);'-5;'+1;'@x\r\n");
    expect(toCsv([[-5]])).toBe("﻿-5\r\n");
  });
});

describe("report", () => {
  const stats = {
    totals: { visitas: 20, visitantesUnicos: 7, actividades: 3, publicadas: 2, reuniones: 1, asesorias: 2 },
    months: [{ mes: "2026-10-01", visitas: 20, visitantesUnicos: 7, actividades: 3 }],
  };

  it("arma el resumen y el desglose mensual", () => {
    const rows = statsReportRows(stats, { kind: "month", year: 2026, month: 10 }, new Date(2026, 9, 21));
    expect(rows).toContainEqual(["Período", "octubre de 2026"]);
    expect(rows).toContainEqual(["Visitantes únicos", 7]);
    expect(rows.at(-1)).toEqual(["oct 2026", 20, 7, 3]);
  });

  it("nombra el archivo según el período", () => {
    expect(reportFilename({ kind: "month", year: 2026, month: 4 })).toBe("reporte-ame-2026-04.csv");
    expect(reportFilename({ kind: "year", year: 2026 })).toBe("reporte-ame-2026.csv");
  });
});

describe("tracking", () => {
  beforeEach(() => {
    insertPageView.mockReset();
    localStorage.clear();
  });

  it("limpia la ruta para la política RLS", () => {
    expect(sanitizePage("/servicios")).toBe("/servicios");
    expect(sanitizePage("/a b?c=1#x")).toBe("/abc1x");
    expect(sanitizePage("x".repeat(200))).toHaveLength(128);
  });

  it("registra la visita con un visitante estable", async () => {
    await trackPageView("/", CHROME);
    await trackPageView("/empresa", CHROME);
    expect(insertPageView).toHaveBeenCalledTimes(2);
    const [first, second] = insertPageView.mock.calls.map(([view]) => view);
    expect(second.page).toBe("/empresa");
    expect(second.visitorId).toBe(first.visitorId);
  });

  it("no registra bots y no propaga errores", async () => {
    await trackPageView("/", "WhatsApp/2.23.20.0 A");
    expect(insertPageView).not.toHaveBeenCalled();

    insertPageView.mockRejectedValueOnce(new Error("sin conexión"));
    await expect(trackPageView("/", CHROME)).resolves.toBeUndefined();
  });
});
