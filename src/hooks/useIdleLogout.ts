import { useEffect, useRef } from "react";

/** Minutos sin actividad tras los que se cierra la sesión del panel. */
export const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

// La última actividad se comparte entre pestañas: trabajar en una mantiene viva la otra.
const STORAGE_KEY = "ame_admin_last_activity";
const CHECK_INTERVAL_MS = 15 * 1000;
const WRITE_THROTTLE_MS = 5 * 1000;
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"] as const;

function readStored(): number | null {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function store(time: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(time));
  } catch {
    // Sin localStorage la marca solo vive en esta pestaña.
  }
}

/** Marca actividad ahora. Se llama al iniciar sesión para que una marca vieja no la cierre. */
export function markAdminActivity() {
  store(Date.now());
}

/** Borra la marca al cerrar sesión. */
export function clearAdminActivity() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que borrar.
  }
}

/**
 * Llama a onIdle si pasan timeoutMs sin actividad del usuario (en ninguna pestaña).
 * También al volver a la pestaña o al despertar el equipo si el plazo ya se cumplió.
 * Con enabled = false no hace nada (p. ej. mientras no hay sesión de admin).
 */
export function useIdleLogout(onIdle: () => void, { enabled = true, timeoutMs = ADMIN_IDLE_TIMEOUT_MS } = {}) {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!enabled) return;

    let lastActivity = Date.now();
    let lastWrite = 0;
    let fired = false;

    // Una marca vieja de una visita anterior también cuenta: si ya venció, se cierra.
    const stored = readStored();
    if (stored !== null && Date.now() - stored >= timeoutMs) lastActivity = stored;
    else store(lastActivity);

    const check = () => {
      if (fired) return;
      const latest = Math.max(lastActivity, readStored() ?? 0);
      if (Date.now() - latest >= timeoutMs) {
        fired = true;
        onIdleRef.current();
      }
    };

    const onActivity = () => {
      lastActivity = Date.now();
      if (lastActivity - lastWrite >= WRITE_THROTTLE_MS) {
        lastWrite = lastActivity;
        store(lastActivity);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") check();
    };

    check();
    const interval = window.setInterval(check, CHECK_INTERVAL_MS);
    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, onActivity, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, timeoutMs]);
}
