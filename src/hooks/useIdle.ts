import { useEffect, useState } from "react";

/**
 * Ejecuta cb cuando el navegador esté libre (requestIdleCallback), como máximo a los 2 s.
 * Sirve para trabajo que no debe competir con la primera pintura (LCP): cargar supabase-js,
 * consultar textos editables o registrar la visita. Devuelve una función para cancelar.
 */
export function whenIdle(cb: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 1200);
  return () => window.clearTimeout(id);
}

/** false durante la primera pintura; true cuando el navegador queda libre. */
export function useIdleReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => whenIdle(() => setReady(true)), []);
  return ready;
}
