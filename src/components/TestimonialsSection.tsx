import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Skeleton } from "@/components/ui/skeleton";
import { Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  business_type: string | null;
  content: string;
  image_url: string | null;
}

const TestimonialsSection = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useScrollReveal();

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, name, business_type, content, image_url")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data);
        setLoading(false);
      });
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section ref={ref} className="px-6 md:px-10 py-14 bg-secondary/30">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        Lo que dicen nuestros clientes
      </h2>
      <p className="text-muted-foreground text-center mb-10 text-sm">
        Historias reales de empresarios que confían en AME S.A.S.
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl p-6 space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-3 gap-6 max-w-5xl mx-auto">
            {items.map((t) => (
              <TestimonialCard key={t.id} item={t} />
            ))}
          </div>
          {/* Mobile horizontal scroll */}
          <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-2 px-2">
            {items.map((t) => (
              <div key={t.id} className="min-w-[280px] snap-center">
                <TestimonialCard item={t} />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

const TestimonialCard = ({ item }: { item: Testimonial }) => (
  <div className="bg-card shadow-md rounded-xl p-6 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-border">
    <Quote size={24} className="text-primary/30" />
    <p className="text-foreground text-base leading-relaxed flex-1">"{item.content}"</p>
    <div className="flex items-center gap-3 pt-2 border-t border-border">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
          {item.name.charAt(0)}
        </div>
      )}
      <div>
        <p className="font-semibold text-foreground text-sm">{item.name}</p>
        {item.business_type && (
          <p className="text-xs text-muted-foreground">{item.business_type}</p>
        )}
      </div>
    </div>
  </div>
);

export default TestimonialsSection;
