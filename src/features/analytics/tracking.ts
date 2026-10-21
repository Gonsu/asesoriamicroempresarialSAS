import { isBotUserAgent } from "./bots";
import { insertPageView } from "./service";

const VISITOR_KEY = "ame_visitor_id";
// Si localStorage no está disponible (modo privado, bloqueado), se usa un id por pestaña.
let fallbackVisitorId: string | null = null;

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    fallbackVisitorId ??= crypto.randomUUID();
    return fallbackVisitorId;
  }
}

/** Deja la ruta en el formato que acepta la política RLS de page_views. */
export function sanitizePage(path: string): string {
  const clean = path.replace(/[^A-Za-z0-9/_-]/g, "");
  return (clean.startsWith("/") ? clean : `/${clean}`).slice(0, 128);
}

/** Registra la visita a una página. Los errores se ignoran: la analítica no debe romper el sitio. */
export async function trackPageView(pathname: string, userAgent = navigator.userAgent): Promise<void> {
  if (isBotUserAgent(userAgent)) return;
  try {
    await insertPageView({
      page: sanitizePage(pathname),
      visitorId: getVisitorId(),
      userAgent: userAgent.slice(0, 512),
    });
  } catch {
    // Sin conexión o rechazada por RLS: no se reintenta.
  }
}
