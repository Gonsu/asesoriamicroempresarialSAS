import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft, BarChart3, Calendar, FileText, MessageSquareQuote, Inbox } from "lucide-react";
import { ListSkeleton } from "@/components/QueryState";
import Seo from "@/components/Seo";

// Cada pestaña es un chunk aparte: solo se descarga al abrirla.
const AdminDashboard = lazy(() => import("@/features/analytics/components/AdminDashboard"));
const MeetingsManager = lazy(() => import("@/features/meetings/components/MeetingsManager"));
const TestimonialsManager = lazy(() => import("@/features/testimonials/components/TestimonialsManager"));
const ContentEditor = lazy(() => import("@/features/content/components/ContentEditor"));
const ContactMessagesManager = lazy(() => import("@/features/contact/components/ContactMessagesManager"));

const tabs = [
  { id: "dashboard", label: "Estadísticas", icon: BarChart3 },
  { id: "meetings", label: "Reuniones", icon: Calendar },
  { id: "testimonials", label: "Testimonios", icon: MessageSquareQuote },
  { id: "content", label: "Contenido", icon: FileText },
  { id: "messages", label: "Mensajes", icon: Inbox },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Admin = () => {
  // RequireAdmin garantiza que aquí ya hay sesión de admin.
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  // Primero se sale del panel: si se cerrara la sesión antes, RequireAdmin redirigiría a /login.
  const handleSignOut = async () => {
    navigate("/", { replace: true });
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo path="/admin" />
      <header className="bg-card border-b border-border px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground">
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

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6">
        <Suspense fallback={<ListSkeleton />}>
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "meetings" && <MeetingsManager />}
          {activeTab === "testimonials" && <TestimonialsManager />}
          {activeTab === "content" && <ContentEditor />}
          {activeTab === "messages" && <ContactMessagesManager />}
        </Suspense>
      </main>
    </div>
  );
};

export default Admin;
