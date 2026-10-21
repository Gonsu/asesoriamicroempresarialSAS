import { imageUrl } from "@/lib/storageImage";
import { Calendar, Users } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublishedMeetings } from "../hooks";

const MeetingsSection = () => {
  const { data: meetings, isPending, isError } = usePublishedMeetings();
  const ref = useScrollReveal();

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

      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto" aria-busy="true" aria-label="Cargando">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <Skeleton className="w-full h-44 rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No pudimos cargar las reuniones. Inténtalo de nuevo más tarde.</p>
        </div>
      ) : meetings.length === 0 ? (
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
              {m.image_path && (
                <img src={imageUrl(m.image_path)} alt={m.title} className="w-full h-44 object-cover" />
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

export default MeetingsSection;
