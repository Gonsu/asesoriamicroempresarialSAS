import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  /** Si cambia (p. ej. la ruta), se descarta el error y se vuelve a intentar el render. */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/**
 * Captura errores de render (incluido un chunk de React.lazy que no carga tras un despliegue)
 * y muestra un mensaje con opción de recargar en lugar de una pantalla en blanco.
 * App le pasa la ruta como resetKey, así que navegar a otra página lo reinicia.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-destructive/70" />
          <h1 className="text-xl font-semibold text-foreground mb-2">Algo salió mal</h1>
          <p className="text-sm text-muted-foreground mb-6">
            No pudimos mostrar esta página. Recarga para intentarlo de nuevo.
          </p>
          <Button onClick={() => window.location.reload()}>Recargar</Button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
