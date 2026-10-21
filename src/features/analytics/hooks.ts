import { useEffect, useRef } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useConsent } from "@/features/consent/useConsent";
import { whenIdle } from "@/hooks/useIdle";
import { periodRange, type Period } from "./period";
import { fetchStats } from "./service";
import { trackPageView } from "./tracking";

export function useStats(period: Period) {
  const { desde, hasta } = periodRange(period);
  return useQuery({
    queryKey: ["stats", desde, hasta],
    queryFn: () => fetchStats(period),
    placeholderData: keepPreviousData,
  });
}

/**
 * Registra una visita en cada cambio de ruta (los cambios de #ancla no cuentan). Con
 * consentimiento de estadísticas incluye el identificador de visitante. Aceptar o rechazar
 * en el aviso no vuelve a contar la página actual.
 */
export function usePageViewTracking() {
  const { pathname } = useLocation();
  const { statistics } = useConsent();
  const statisticsRef = useRef(statistics);
  statisticsRef.current = statistics;
  useEffect(
    // Con el navegador libre: registrar la visita no compite con la primera pintura.
    () => whenIdle(() => void trackPageView(pathname, { withVisitorId: statisticsRef.current })),
    [pathname],
  );
}
