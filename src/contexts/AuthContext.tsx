import { useEffect, useRef, useState, type ReactNode } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import type { AuthChangeEvent, User, Session } from "@supabase/supabase-js";
import { AuthContext } from "@/contexts/auth-context";
import { clearAdminActivity, markAdminActivity } from "@/hooks/useIdleLogout";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // Usuario cuyo rol ya se consultó; evita repetir la consulta en cada TOKEN_REFRESHED.
  const checkedUserId = useRef<string | null>(null);

  const checkAdmin = async (userId: string) => {
    try {
      const supabase = await getSupabase();
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
      setIsAdmin(!!data);
    } catch (err) {
      console.error("[AUTH] Excepción verificando rol:", err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Se dispara también al suscribirse (INITIAL_SESSION), así que cubre la carga inicial
    // y el regreso del login con Google. loading sigue en true hasta conocer el rol, para
    // que /admin no redirija a /login antes de tiempo.
    let unsubscribe: (() => void) | null = null;
    void getSupabase().then((supabase) => {
      if (!mounted) return;
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, newSession: Session | null) => {
          if (!mounted) return;
          setSession(newSession);
          setUser(newSession?.user ?? null);

          const userId = newSession?.user.id ?? null;
          if (userId === checkedUserId.current) {
            setLoading(false);
            return;
          }
          checkedUserId.current = userId;

          if (!userId) {
            setIsAdmin(false);
            setLoading(false);
            return;
          }

          setLoading(true);
          // Diferir para evitar deadlock dentro del callback
          setTimeout(async () => {
            if (!mounted) return;
            await checkAdmin(userId);
            if (mounted && checkedUserId.current === userId) setLoading(false);
          }, 0);
        }
      );
      unsubscribe = () => subscription.unsubscribe();
    });

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
      unsubscribe?.();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) markAdminActivity();
    return { error: error as Error | null };
  };

  // Solo entra si la cuenta ya existe: el registro público está desactivado en Supabase.
  // Vuelve a /login, que muestra el error o redirige a /admin según el rol.
  const signInWithGoogle = async () => {
    // La marca se pone antes de salir hacia Google; al volver, la sesión empieza activa.
    markAdminActivity();
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    clearAdminActivity();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
