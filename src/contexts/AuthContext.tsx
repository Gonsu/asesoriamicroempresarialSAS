import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string) => {
    try {
      console.log("[AUTH] Verificando rol admin para", userId);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (error) {
        console.error("[AUTH] Error verificando rol:", error);
        setIsAdmin(false);
        return;
      }
      console.log("[AUTH] isAdmin:", !!data);
      setIsAdmin(!!data);
    } catch (err) {
      console.error("[AUTH] Excepción verificando rol:", err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Listener: solo actualiza sesión sincrónicamente, difiere consultas
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("[AUTH] onAuthStateChange:", event);
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          // Diferir para evitar deadlock dentro del callback
          setTimeout(() => {
            if (mounted) checkAdmin(newSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    // Chequeo inicial
    (async () => {
      try {
        console.log("[AUTH] Iniciando getSession");
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("[AUTH] Error getSession:", error);
        console.log("[AUTH] Sesión obtenida:", !!data.session);
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          await checkAdmin(data.session.user.id);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("[AUTH] Excepción en init:", err);
      } finally {
        if (mounted) {
          console.log("[AUTH] authLoading: false");
          setLoading(false);
        }
      }
    })();

    // Fail-safe: nunca quedarse cargando más de 5s
    const failSafe = setTimeout(() => {
      if (mounted) {
        console.warn("[AUTH] Fail-safe: forzando loading=false");
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(failSafe);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
