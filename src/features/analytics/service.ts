import { supabase } from "@/integrations/supabase/client";
import { monthsInPeriod, periodRange, type Period } from "./period";

export interface StatsTotals {
  visitas: number;
  visitantesUnicos: number;
  actividades: number;
  publicadas: number;
  reuniones: number;
  asesorias: number;
}

export interface MonthStats {
  /** Primer día del mes, YYYY-MM-01. */
  mes: string;
  visitas: number;
  visitantesUnicos: number;
  actividades: number;
}

export interface Stats {
  totals: StatsTotals;
  months: MonthStats[];
}

function rows<T>(result: { data: T[] | null; error: { message: string } | null }): T[] {
  if (result.error) throw new Error(`No se pudieron cargar las estadísticas: ${result.error.message}`);
  return result.data ?? [];
}

/** Estadísticas del período, agregadas en SQL (sin bots). Los meses sin datos van en cero. */
export async function fetchStats(period: Period): Promise<Stats> {
  const { desde, hasta } = periodRange(period);
  const args = { p_desde: desde, p_hasta: hasta };
  const [viewsRes, totalsRes, meetingsRes] = await Promise.all([
    supabase.rpc("page_view_stats", args),
    supabase.rpc("page_view_totals", args),
    supabase.rpc("meeting_stats", args),
  ]);
  const views = rows(viewsRes);
  const [viewTotals] = rows(totalsRes);
  const meetings = rows(meetingsRes);

  const totals: StatsTotals = {
    visitas: viewTotals?.visitas ?? 0,
    visitantesUnicos: viewTotals?.visitantes_unicos ?? 0,
    actividades: 0,
    publicadas: 0,
    reuniones: 0,
    asesorias: 0,
  };
  for (const m of meetings) {
    totals.actividades += m.total;
    totals.publicadas += m.publicadas;
    totals.reuniones += m.reuniones;
    totals.asesorias += m.asesorias;
  }

  const months = monthsInPeriod(period).map((mes) => {
    const v = views.find((row) => row.mes === mes);
    return {
      mes,
      visitas: v?.visitas ?? 0,
      visitantesUnicos: v?.visitantes_unicos ?? 0,
      actividades: meetings.find((row) => row.mes === mes)?.total ?? 0,
    };
  });

  return { totals, months };
}

export async function insertPageView(view: { page: string; visitorId: string; userAgent: string }): Promise<void> {
  const { error } = await supabase.from("page_views").insert({
    page: view.page,
    visitor_id: view.visitorId,
    user_agent: view.userAgent,
  });
  if (error) throw new Error(error.message);
}
