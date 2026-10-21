import { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
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

/** Registra una visita en cada cambio de ruta; los cambios de #ancla no cuentan. */
export function usePageViewTracking() {
  const { pathname } = useLocation();
  useEffect(() => {
    void trackPageView(pathname);
  }, [pathname]);
}
