import type { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useIdleLogout } from "@/hooks/useIdleLogout";

/** Motivo por el que /login recibe al usuario (se pasa en location.state). */
export type LoginRedirectState = { reason?: "idle" | "required" };

/**
 * Envuelve rutas del panel: solo las muestra con sesión de admin y cierra la sesión tras
 * 30 minutos sin actividad. Es una barrera de experiencia de usuario: quien no es admin
 * tampoco obtiene datos, porque la RLS de Supabase los niega en el servidor.
 */
const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useIdleLogout(
    () => {
      void signOut().finally(() =>
        navigate("/login", { replace: true, state: { reason: "idle" } satisfies LoginRedirectState }),
      );
    },
    { enabled: !!user && isAdmin },
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" aria-busy="true">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace state={{ reason: "required" } satisfies LoginRedirectState} />;
  }
  return <>{children}</>;
};

export default RequireAdmin;
