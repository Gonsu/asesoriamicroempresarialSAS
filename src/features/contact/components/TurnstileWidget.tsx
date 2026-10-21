import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { TURNSTILE_ORIGIN } from "@/config/securityHeaders";

// Clave de prueba pública de Cloudflare: el widget siempre aprueba. Se usa mientras no haya
// VITE_TURNSTILE_SITE_KEY; con la clave secreta real, sus tokens se rechazan en el servidor.
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY;
const SCRIPT_URL = `${TURNSTILE_ORIGIN}/turnstile/v0/api.js?render=explicit`;
/** Debe coincidir con TURNSTILE_ACTION de la Edge Function. */
const ACTION = "contact";

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      language: string;
      theme: "light" | "dark" | "auto";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

/** Carga el script de Turnstile una sola vez (solo en las páginas que muestran el widget). */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile no cargó")));
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error("Turnstile no cargó"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface TurnstileHandle {
  /** Pide un token nuevo (cada token sirve una sola vez). */
  reset(): void;
}

/** Widget anti-spam de Cloudflare Turnstile. Informa el token, o null cuando vence o falla. */
const TurnstileWidget = forwardRef<TurnstileHandle, { onToken: (token: string | null) => void }>(
  ({ onToken }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;
    const [failed, setFailed] = useState(false);

    useImperativeHandle(ref, () => ({
      reset() {
        onTokenRef.current(null);
        if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
      },
    }));

    useEffect(() => {
      let cancelled = false;
      loadTurnstile()
        .then((turnstile) => {
          if (cancelled || !containerRef.current) return;
          widgetId.current = turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            action: ACTION,
            language: "es",
            theme: "light",
            callback: (token) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(null),
            "error-callback": () => onTokenRef.current(null),
          });
        })
        .catch(() => !cancelled && setFailed(true));
      return () => {
        cancelled = true;
        if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      };
    }, []);

    if (failed) {
      return (
        <p role="alert" className="text-xs text-destructive">
          No se pudo cargar la verificación anti-spam. Revisa tu conexión y recarga la página.
        </p>
      );
    }
    return <div ref={containerRef} role="group" aria-label="Verificación anti-spam" className="min-h-[65px]" />;
  },
);
TurnstileWidget.displayName = "TurnstileWidget";

export default TurnstileWidget;
