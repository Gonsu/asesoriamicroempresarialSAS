import Seo from "@/components/Seo";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, isAdmin, loading: authLoading, signIn, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Con sesión de admin (contraseña o regreso de Google) se pasa directo al panel.
  useEffect(() => {
    if (!authLoading && user && isAdmin) navigate("/admin", { replace: true });
  }, [authLoading, user, isAdmin, navigate]);

  // Supabase devuelve los errores de OAuth en la URL (query o hash), p. ej. cuando la
  // cuenta de Google no existe y el registro público está desactivado.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const code = params.get("error_code") ?? hash.get("error_code");
    const error = params.get("error") ?? hash.get("error");
    if (!error && !code) return;

    toast({
      title: "Error con Google",
      description:
        code === "signup_disabled"
          ? "Esta cuenta de Google no está autorizada. Pide a un administrador que te invite."
          : "No se pudo iniciar sesión con Google.",
      variant: "destructive",
    });
    window.history.replaceState(null, "", window.location.pathname);
  }, [toast]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    // Si no hay error el navegador ya se está yendo a Google.
    if (error) {
      setGoogleLoading(false);
      toast({
        title: "Error con Google",
        description: "No se pudo iniciar sesión con Google.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({
        title: "Error de inicio de sesión",
        description: "Credenciales incorrectas. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Seo
        title="Acceso administrativo | AME S.A.S."
        description="Acceso restringido al panel administrativo de AME S.A.S."
        path="/login"
        noindex
      />
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-border p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--gold))] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Panel Administrativo</h1>
            <p className="text-muted-foreground text-sm mt-1">AME S.A.S. — Acceso exclusivo</p>
          </div>

          {!authLoading && user && !isAdmin && (
            <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
              <p className="text-foreground">
                La cuenta <strong>{user.email}</strong> no tiene permisos de administrador.
              </p>
              <button
                type="button"
                onClick={signOut}
                className="mt-2 text-primary hover:underline"
              >
                Cerrar sesión y usar otra cuenta
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ame.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">o</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {googleLoading ? "Conectando..." : "Continuar con Google"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={14} /> Volver al sitio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
