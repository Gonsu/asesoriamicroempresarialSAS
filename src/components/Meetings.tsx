import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  meeting_date: string | null;
  image_url: string | null;
  type: string;
}

const Meetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useScrollReveal();

  useEffect(() => {
    const fetchMeetings = async () => {
      const { data } = await supabase
        .from("meetings")
        .select("id, title, description, meeting_date, image_url, type")
        .eq("published", true)
        .order("meeting_date", { ascending: false });
      if (data) setMeetings(data);
      setLoading(false);
    };
    fetchMeetings();
  }, []);

  if (loading) {
    return (
      <section id="meetings" className="px-8 py-14 bg-secondary/50">
        <div className="text-center text-muted-foreground">Cargando...</div>
      </section>
    );
  }

  return (
    <section id="meetings" ref={ref} className="px-8 py-14 bg-secondary/50">
      <div className="text-center mb-10">
        <span className="text-[11px] font-semibold tracking-[3px] uppercase text-primary">
          Actividades
        </span>
        <h2 className="text-2xl md:text-3xl font-bold mt-2 text-foreground">
          Reuniones y Asesorías
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
          Conoce nuestras últimas reuniones y sesiones de asesoría empresarial.
        </p>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Próximamente publicaremos nuestras reuniones y asesorías.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {m.image_url && (
                <img src={m.image_url} alt={m.title} className="w-full h-44 object-cover" />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {m.type === "reunion" ? (
                    <Users size={14} className="text-[hsl(var(--blue))]" />
                  ) : (
                    <Calendar size={14} className="text-accent" />
                  )}
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                    m.type === "reunion" ? "text-[hsl(var(--blue))]" : "text-accent"
                  }`}>
                    {m.type === "reunion" ? "Reunión" : "Asesoría"}
                  </span>
                </div>
                <h3 className="font-bold text-foreground">{m.title}</h3>
                {m.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{m.description}</p>
                )}
                {m.meeting_date && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    📅 {new Date(m.meeting_date).toLocaleDateString("es-CO", { dateStyle: "long" })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Meetings;
