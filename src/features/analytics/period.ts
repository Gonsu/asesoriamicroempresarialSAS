/** Período del panel de estadísticas. month va de 1 a 12. */
export type Period = { kind: "month"; year: number; month: number } | { kind: "year"; year: number };

export type MonthPeriod = Extract<Period, { kind: "month" }>;

/** Primer año con visitas registradas (las importadas de Lovable empiezan en abril de 2026). */
export const ANALYTICS_START_YEAR = 2026;

export const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/** Fechas locales (YYYY-MM-DD), ambas inclusive, como las esperan las funciones SQL. */
export function periodRange(period: Period): { desde: string; hasta: string } {
  if (period.kind === "year") {
    return { desde: `${period.year}-01-01`, hasta: `${period.year}-12-31` };
  }
  const lastDay = new Date(Date.UTC(period.year, period.month, 0)).getUTCDate();
  const prefix = `${period.year}-${pad(period.month)}`;
  return { desde: `${prefix}-01`, hasta: `${prefix}-${pad(lastDay)}` };
}

/** Primer día de cada mes del período (YYYY-MM-01), igual que la columna mes de SQL. */
export function monthsInPeriod(period: Period): string[] {
  if (period.kind === "month") return [`${period.year}-${pad(period.month)}-01`];
  return MONTH_NAMES.map((_, i) => `${period.year}-${pad(i + 1)}-01`);
}

export function periodLabel(period: Period): string {
  return period.kind === "year" ? `${period.year}` : `${MONTH_NAMES[period.month - 1]} de ${period.year}`;
}

/** "2026-10-01" → "oct 2026". */
export function monthLabel(mes: string): string {
  const [year, month] = mes.split("-").map(Number);
  return `${MONTH_NAMES[month - 1].slice(0, 3)} ${year}`;
}

export function currentPeriod(now = new Date()): MonthPeriod {
  return { kind: "month", year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** Años seleccionables, del más reciente al primero con datos. */
export function yearOptions(now = new Date()): number[] {
  const years: number[] = [];
  for (let y = Math.max(now.getFullYear(), ANALYTICS_START_YEAR); y >= ANALYTICS_START_YEAR; y--) years.push(y);
  return years;
}
