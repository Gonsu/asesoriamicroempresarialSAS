import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Eye, Users, Calendar, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

interface Stats {
  totalMeetings: number;
  publishedMeetings: number;
  reuniones: number;
  asesorias: number;
  totalViews: number;
  uniqueVisitors: number;
  viewsByMonth: { month: string; views: number; unique: number }[];
  meetingsByMonth: { month: string; count: number }[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState<"month" | "year">("month");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [meetingsRes, viewsRes] = await Promise.all([
      supabase.from("meetings").select("*"),
      supabase.from("page_views").select("*"),
    ]);

    const meetings = meetingsRes.data || [];
    const views = viewsRes.data || [];

    const viewsByMonth: Record<string, { views: number; visitors: Set<string> }> = {};
    const meetingsByMonth: Record<string, number> = {};

    views.forEach((v: any) => {
      const month = new Date(v.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "short" });
      if (!viewsByMonth[month]) viewsByMonth[month] = { views: 0, visitors: new Set() };
      viewsByMonth[month].views++;
      viewsByMonth[month].visitors.add(v.visitor_id);
    });

    meetings.forEach((m: any) => {
      const month = new Date(m.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "short" });
      meetingsByMonth[month] = (meetingsByMonth[month] || 0) + 1;
    });

    const uniqueVisitors = new Set(views.map((v: any) => v.visitor_id)).size;

    setStats({
      totalMeetings: meetings.length,
      publishedMeetings: meetings.filter((m: any) => m.published).length,
      reuniones: meetings.filter((m: any) => m.type === "reunion").length,
      asesorias: meetings.filter((m: any) => m.type === "asesoria").length,
      totalViews: views.length,
      uniqueVisitors,
      viewsByMonth: Object.entries(viewsByMonth).map(([month, data]) => ({
        month,
        views: data.views,
        unique: data.visitors.size,
      })),
      meetingsByMonth: Object.entries(meetingsByMonth).map(([month, count]) => ({ month, count })),
    });
    setLoading(false);
  };

  const generateExcel = () => {
    if (!stats) return;

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["Estadísticas AME S.A.S.", ""],
      ["Período", reportPeriod === "month" ? "Último mes" : "Último año"],
      ["Fecha de generación", new Date().toLocaleDateString("es-CO")],
      ["", ""],
      ["Métrica", "Valor"],
      ["Total reuniones/asesorías", stats.totalMeetings],
      ["Publicadas", stats.publishedMeetings],
      ["Reuniones", stats.reuniones],
      ["Asesorías", stats.asesorias],
      ["Total visitas a la página", stats.totalViews],
      ["Visitantes únicos", stats.uniqueVisitors],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1["!cols"] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Resumen");

    // Views by month
    const viewsData = [
      ["Mes", "Visitas totales", "Visitantes únicos"],
      ...stats.viewsByMonth.map((v) => [v.month, v.views, v.unique]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(viewsData);
    ws2["!cols"] = [{ wch: 20 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Visitas por Mes");

    // Meetings by month
    const meetingsData = [
      ["Mes", "Reuniones/Asesorías creadas"],
      ...stats.meetingsByMonth.map((m) => [m.month, m.count]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(meetingsData);
    ws3["!cols"] = [{ wch: 20 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Actividades por Mes");

    XLSX.writeFile(wb, `reporte-ame-${reportPeriod}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">Cargando estadísticas...</p>;
  if (!stats) return null;

  const cards = [
    { icon: Calendar, label: "Total actividades", value: stats.totalMeetings, color: "text-primary" },
    { icon: TrendingUp, label: "Publicadas", value: stats.publishedMeetings, color: "text-accent" },
    { icon: Users, label: "Reuniones", value: stats.reuniones, color: "text-[hsl(var(--blue))]" },
    { icon: BarChart3, label: "Asesorías", value: stats.asesorias, color: "text-primary" },
    { icon: Eye, label: "Visitas totales", value: stats.totalViews, color: "text-accent" },
    { icon: Users, label: "Visitantes únicos", value: stats.uniqueVisitors, color: "text-[hsl(var(--blue))]" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <c.icon size={16} className={c.color} />
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Views chart (simple bar visualization) */}
      {stats.viewsByMonth.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Visitas por mes</h3>
          <div className="space-y-3">
            {stats.viewsByMonth.slice(-6).map((v) => {
              const maxViews = Math.max(...stats.viewsByMonth.map((x) => x.views), 1);
              return (
                <div key={v.month} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground min-w-[80px]">{v.month}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                      style={{ width: `${(v.views / maxViews) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground min-w-[60px] text-right">
                    {v.views} / {v.unique} únicos
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Excel export */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Generar reporte Excel</h3>
        <div className="flex items-center gap-3">
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value as "month" | "year")}
          >
            <option value="month">Mensual</option>
            <option value="year">Anual</option>
          </select>
          <Button onClick={generateExcel} size="sm">
            <Download size={14} className="mr-1" /> Descargar reporte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
