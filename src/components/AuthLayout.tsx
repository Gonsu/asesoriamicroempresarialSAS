import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

/**
 * Envoltorio de /login y /admin, cargado en diferido: la sesión de Supabase y los avisos
 * (toasts) solo se necesitan ahí, así que no van en el JS inicial de los visitantes.
 */
const AuthLayout = () => (
  <AuthProvider>
    <Toaster />
    <Outlet />
  </AuthProvider>
);

export default AuthLayout;
