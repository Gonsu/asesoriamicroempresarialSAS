import { useState } from "react";
import { BarChart3, Eye, Users, Calendar, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/QueryState";
import { downloadCsv, toCsv } from "../csv";
import { useStats } from "../hooks";
import { MONTH_NAMES, currentPeriod, monthLabel, periodLabel, yearOptions, type Period } from "../period";
import { reportFilename, statsReportRows } from "../report";

const selectClass = "h-9 rounded-md border border-input bg-background px-3 text-sm";

const AdminDashboard = () => {
  const [period, setPeriod] = useState<Period>(() => currentPeriod());
  const { data: stats, isPending, isError, error, refetch, isFetching } = useStats(period);
  const today = currentPeriod();

  const changeKind = (kind: Period["kind"]) =>
    setPeriod(kind === "year" ? { kind, year: period.year } : { kind, year: period.year, month: today.month });

  const downloadReport = () => {
    if (!stats) return;
    downloadCsv(reportFilename(period), toCsv(statsReportRows(stats, period)));
  };

  const cards = stats && [
    { icon: Calendar, label: "Total actividades", value: stats.totals.actividades, color: "text-primary" },
    { icon: TrendingUp, label: "Publicadas", value: stats.totals.publicadas, color: "text-accent" },
    { icon: Users, label: "Reuniones", value: stats.totals.reuniones, color: "text-[hsl(var(--blue))]" },
    { icon: BarChart3, label: "Asesorías", value: stats.totals.asesorias, color: "text-primary" },
    { icon: Eye, label: "Visitas totales", value: stats.totals.visitas, color: "text-accent" },
    { icon: Users, label: "Visitantes únicos", value: stats.totals.visitantesUnicos, color: "text-[hsl(var(--blue))]" },
  ];
  const maxViews = Math.max(...(stats?.months.map((m) => m.visitas) ?? []), 1);

  return (
    <div className="space-y-6">
      {/* Período */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Período</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            aria-label="Tipo de período"
            className={selectClass}
            value={period.kind}
            onChange={(e) => changeKind(e.target.value as Period["kind"])}
          >
            <option value="month">Mensual</option>
            <option value="year">Anual</option>
          </select>
          {period.kind === "month" && (
            <select
              aria-label="Mes"
              className={selectClass}
              value={period.month}
              onChange={(e) => setPeriod({ ...period, month: Number(e.target.value) })}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </option>
              ))}
            </select>
          )}
          <select
            aria-label="Año"
            className={selectClass}
            value={period.year}
            onChange={(e) => setPeriod({ ...period, year: Number(e.target.value) })}
          >
            {yearOptions().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <Button onClick={downloadReport} size="sm" disabled={!stats}>
            <Download size={14} className="mr-1" /> Descargar CSV
          </Button>
          {isFetching && !isPending && <span className="text-xs text-muted-foreground">Actualizando...</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Cifras de {periodLabel(period)}. Las visitas de bots y vistas previas de enlaces no se cuentan. Los
          visitantes únicos solo incluyen a quienes aceptaron las estadísticas en el aviso de cookies.
        </p>
      </div>

      {isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : (
        <>
          {/* Tarjetas */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cards
              ? cards.map((c) => (
                  <div key={c.label} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <c.icon size={16} className={c.color} />
                      <span className="text-xs text-muted-foreground">{c.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{c.value}</p>
                  </div>
                ))
              : Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[88px] rounded-xl" />)}
          </div>

          {/* Visitas por mes (barras simples) */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Visitas por mes</h3>
            <div className="space-y-3">
              {stats
                ? stats.months.map((m) => (
                    <div key={m.mes} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground min-w-[80px]">{monthLabel(m.mes)}</span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                          style={{ width: `${(m.visitas / maxViews) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground min-w-[60px] text-right">
                        {m.visitas} / {m.visitantesUnicos} únicos
                      </span>
                    </div>
                  ))
                : Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-6 rounded-full" />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
