import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw } from "lucide-react";

interface SectionContent {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  extra_data: any;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "🏠 Hero (Inicio)",
  about: "👥 Quiénes Somos",
  services: "💼 Servicios",
  whyus: "⭐ ¿Por Qué Elegirnos?",
  cta: "📞 Llamado a la Acción",
  footer: "📋 Footer",
};

const ContentEditor = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<SectionContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedSections, setEditedSections] = useState<Record<string, Partial<SectionContent>>>({});

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("site_content")
      .select("*")
      .order("created_at");
    if (data) setSections(data as SectionContent[]);
    setLoading(false);
  };

  const handleChange = (sectionKey: string, field: string, value: string) => {
    setEditedSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [field]: value },
    }));
  };

  const handleSave = async (section: SectionContent) => {
    const changes = editedSections[section.section_key];
    if (!changes) return;

    setSaving(section.section_key);
    const { error } = await supabase
      .from("site_content")
      .update(changes)
      .eq("id", section.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Guardado", description: `Sección "${SECTION_LABELS[section.section_key] || section.section_key}" actualizada.` });
      setEditedSections((prev) => {
        const next = { ...prev };
        delete next[section.section_key];
        return next;
      });
      fetchContent();
    }
    setSaving(null);
  };

  const handleReset = (sectionKey: string) => {
    setEditedSections((prev) => {
      const next = { ...prev };
      delete next[sectionKey];
      return next;
    });
  };

  const getValue = (section: SectionContent, field: keyof SectionContent) => {
    const edited = editedSections[section.section_key];
    if (edited && field in edited) return (edited as any)[field] || "";
    return (section[field] as string) || "";
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">Cargando contenido...</p>;

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const hasChanges = !!editedSections[section.section_key];
        return (
          <div key={section.id} className="bg-card border border-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">
                {SECTION_LABELS[section.section_key] || section.section_key}
              </h3>
              {hasChanges && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleReset(section.section_key)}>
                    <RotateCcw size={14} className="mr-1" /> Descartar
                  </Button>
                  <Button size="sm" onClick={() => handleSave(section)} disabled={saving === section.section_key}>
                    <Save size={14} className="mr-1" /> {saving === section.section_key ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={getValue(section, "title")}
                  onChange={(e) => handleChange(section.section_key, "title", e.target.value)}
                />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input
                  value={getValue(section, "subtitle")}
                  onChange={(e) => handleChange(section.section_key, "subtitle", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Descripción</Label>
              <Textarea
                value={getValue(section, "description")}
                onChange={(e) => handleChange(section.section_key, "description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContentEditor;
