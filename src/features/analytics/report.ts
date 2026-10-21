import type { CsvCell } from "./csv";
import { monthLabel, periodLabel, type Period } from "./period";
import type { Stats } from "./service";

/** Filas del reporte CSV: resumen del período y desglose por mes. */
export function statsReportRows(stats: Stats, period: Period, generatedAt = new Date()): CsvCell[][] {
  const { totals, months } = stats;
  return [
    ["Estadísticas AME S.A.S."],
    ["Período", periodLabel(period)],
    ["Fecha de generación", generatedAt.toLocaleDateString("es-CO")],
    [],
    ["Métrica", "Valor"],
    ["Total reuniones/asesorías", totals.actividades],
    ["Publicadas", totals.publicadas],
    ["Reuniones", totals.reuniones],
    ["Asesorías", totals.asesorias],
    ["Visitas a la página (sin bots)", totals.visitas],
    ["Visitantes únicos (solo quienes aceptaron estadísticas)", totals.visitantesUnicos],
    [],
    ["Mes", "Visitas", "Visitantes únicos (con consentimiento)", "Reuniones/asesorías creadas"],
    ...months.map((m) => [monthLabel(m.mes), m.visitas, m.visitantesUnicos, m.actividades]),
  ];
}

export function reportFilename(period: Period): string {
  const suffix =
    period.kind === "year" ? `${period.year}` : `${period.year}-${String(period.month).padStart(2, "0")}`;
  return `reporte-ame-${suffix}.csv`;
}
