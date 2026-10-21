import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import RequireAdmin from "@/components/RequireAdmin";
import Layout from "@/components/Layout";
import Index from "./pages/Index.tsx";

// Inicio va en el bundle principal; las demás páginas se cargan al visitarlas. El login y el
// panel van en chunks aparte, así que los visitantes nunca los descargan.
const Empresa = lazy(() => import("./pages/Empresa.tsx"));
const Servicios = lazy(() => import("./pages/Servicios.tsx"));
const Reuniones = lazy(() => import("./pages/Reuniones.tsx"));
const Contacto = lazy(() => import("./pages/Contacto.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center" aria-busy="true">
    <p className="text-muted-foreground">Cargando...</p>
  </div>
);

const AppRoutes = () => {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/empresa" element={<Empresa />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/reuniones" element={<Reuniones />} />
            <Route path="/contacto" element={<Contacto />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
