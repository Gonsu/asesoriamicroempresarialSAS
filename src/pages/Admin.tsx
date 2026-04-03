import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, LogOut, ArrowLeft, Calendar, Users } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  meeting_date: string | null;
  image_url: string | null;
  type: string;
  published: boolean;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    meeting_date: "",
    type: "reunion" as "reunion" | "asesoria",
    published: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchMeetings();
  }, [isAdmin]);

  const fetchMeetings = async () => {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMeetings(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ title: "", description: "", meeting_date: "", type: "reunion", published: false });
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("meeting-images").upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from("meeting-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let image_url: string | null = null;

    if (imageFile) {
      image_url = await uploadImage(imageFile);
    }

    const payload = {
      title: form.title,
      description: form.description || null,
      meeting_date: form.meeting_date || null,
      type: form.type,
      published: form.published,
      ...(image_url && { image_url }),
      ...(!editingId && { created_by: user?.id }),
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("meetings").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("meetings").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Actualizado" : "Creado", description: "Operación exitosa." });
      resetForm();
      fetchMeetings();
    }
  };

  const handleEdit = (m: Meeting) => {
    setForm({
      title: m.title,
      description: m.description || "",
      meeting_date: m.meeting_date ? m.meeting_date.slice(0, 16) : "",
      type: m.type as "reunion" | "asesoria",
      published: m.published,
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    if (!error) {
      toast({ title: "Eliminado", description: "Registro eliminado." });
      fetchMeetings();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--gold))] flex items-center justify-center font-bold text-primary-foreground">
            A
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Panel Admin — AME S.A.S.</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft size={14} className="mr-1" /> Sitio
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut size={14} className="mr-1" /> Salir
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Reuniones y Asesorías</h2>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} className="mr-1" /> Nueva
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-foreground">
              {editingId ? "Editar" : "Crear nueva"} reunión / asesoría
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <Label>Tipo</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "reunion" | "asesoria" })}
                >
                  <option value="reunion">Reunión</option>
                  <option value="asesoria">Asesoría</option>
                </select>
              </div>
              <div>
                <Label>Fecha</Label>
                <Input
                  type="datetime-local"
                  value={form.meeting_date}
                  onChange={(e) => setForm({ ...form, meeting_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Imagen</Label>
                <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              <Label>Publicado (visible para clientes)</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? "Guardar cambios" : "Crear"}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
            </div>
          </form>
        )}

        {meetings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No hay reuniones ni asesorías aún.</p>
            <p className="text-sm">Haz clic en "Nueva" para crear la primera.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start">
                {m.image_url && (
                  <img src={m.image_url} alt={m.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      m.type === "reunion"
                        ? "bg-[hsl(var(--blue-light))] text-[hsl(var(--blue))]"
                        : "bg-[hsl(var(--teal-light))] text-[hsl(var(--green))]"
                    }`}>
                      {m.type === "reunion" ? "Reunión" : "Asesoría"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      m.published ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    }`}>
                      {m.published ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                  <h4 className="font-semibold text-foreground truncate">{m.title}</h4>
                  {m.description && <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>}
                  {m.meeting_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      📅 {new Date(m.meeting_date).toLocaleDateString("es-CO", { dateStyle: "long" })}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)} className="text-destructive hover:text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
