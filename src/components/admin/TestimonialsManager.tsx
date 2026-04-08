import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, MessageSquareQuote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  business_type: string | null;
  content: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

const TestimonialsManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", business_type: "", content: "", is_published: false });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: "", business_type: "", content: "", is_published: false });
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `testimonials/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("meeting-images").upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from("meeting-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let image_url: string | null = null;
    if (imageFile) image_url = await uploadImage(imageFile);

    const payload = {
      name: form.name,
      business_type: form.business_type || null,
      content: form.content,
      is_published: form.is_published,
      ...(image_url && { image_url }),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("testimonials").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("testimonials").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Actualizado" : "Creado", description: "Operación exitosa." });
      resetForm();
      fetchItems();
    }
  };

  const handleEdit = (t: Testimonial) => {
    setForm({
      name: t.name,
      business_type: t.business_type || "",
      content: t.content,
      is_published: t.is_published,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (!error) {
      toast({ title: "Eliminado", description: "Testimonio eliminado." });
      fetchItems();
    }
  };

  const togglePublish = async (t: Testimonial) => {
    await supabase.from("testimonials").update({ is_published: !t.is_published }).eq("id", t.id);
    fetchItems();
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">Cargando...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-foreground">Testimonios</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={16} className="mr-1" /> Nuevo
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-foreground">{editingId ? "Editar" : "Crear"} testimonio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Tipo de negocio</Label>
              <Input value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })} placeholder="Ej: Tienda de ropa" />
            </div>
            <div className="md:col-span-2">
              <Label>Imagen (opcional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <div>
            <Label>Testimonio</Label>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} required />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
            <Label>Publicado</Label>
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? "Guardar cambios" : "Crear"}</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquareQuote className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No hay testimonios aún.</p>
          <p className="text-sm">Haz clic en "Nuevo" para crear el primero.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start">
              {t.image_url && (
                <img src={t.image_url} alt={t.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    t.is_published ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                  }`}>
                    {t.is_published ? "Publicado" : "Borrador"}
                  </span>
                </div>
                <h4 className="font-semibold text-foreground">{t.name}</h4>
                {t.business_type && <p className="text-xs text-muted-foreground">{t.business_type}</p>}
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">"{t.content}"</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => togglePublish(t)} title={t.is_published ? "Despublicar" : "Publicar"}>
                  <Switch checked={t.is_published} className="pointer-events-none scale-75" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-destructive hover:text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;
