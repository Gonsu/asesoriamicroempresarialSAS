import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft, BarChart3, Calendar, FileText } from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import MeetingsManager from "@/components/admin/MeetingsManager";
import ContentEditor from "@/components/admin/ContentEditor";

const tabs = [
  { id: "dashboard", label: "Estadísticas", icon: BarChart3 },
  { id: "meetings", label: "Reuniones", icon: Calendar },
  { id: "content", label: "Contenido", icon: FileText },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
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
        <div className="max-w-4xl mx-auto flex">
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
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "meetings" && <MeetingsManager />}
        {activeTab === "content" && <ContentEditor />}
      </main>
    </div>
  );
};

export default Admin;
