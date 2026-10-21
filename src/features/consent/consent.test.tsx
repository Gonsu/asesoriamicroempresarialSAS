import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PRIVACY_POLICY_VERSION } from "@/config/legal";
import { CONSENT_KEY, readConsent } from "./consent";
import { ConsentProvider } from "./ConsentProvider";
import CookieBanner from "./components/CookieBanner";
import { useConsent } from "./useConsent";

const trackPageView = vi.fn();
vi.mock("@/features/analytics/tracking", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/analytics/tracking")>()),
  trackPageView: (...args: unknown[]) => trackPageView(...args),
}));

const { usePageViewTracking } = await import("@/features/analytics/hooks");
const { default: MapEmbed } = await import("@/features/contact/components/MapEmbed");

const Tracker = () => {
  usePageViewTracking();
  return null;
};

/** Como el enlace "Preferencias de cookies" del pie de página. */
const OpenPreferences = () => {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings}>
      Preferencias de cookies
    </button>
  );
};

const renderWith = (ui: React.ReactNode) =>
  render(
    <ConsentProvider>
      <MemoryRouter>
        {ui}
        <CookieBanner />
      </MemoryRouter>
    </ConsentProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  trackPageView.mockReset();
});

describe("aviso de cookies", () => {
  it("aparece sin elección y Rechazar guarda todo en false", () => {
    renderWith(null);
    expect(screen.getByRole("dialog", { name: "Aviso de cookies y almacenamiento local" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(readConsent()).toMatchObject({ statistics: false, maps: false, version: PRIVACY_POLICY_VERSION });
  });

  it("Configurar permite elegir por categoría", () => {
    renderWith(null);
    fireEvent.click(screen.getByRole("button", { name: "Configurar" }));
    fireEvent.click(screen.getByRole("switch", { name: "Mapas" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar preferencias" }));
    expect(readConsent()).toMatchObject({ statistics: false, maps: true });
  });

  it("vuelve a preguntar si cambió la versión de la política", () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ statistics: true, maps: true, version: "2000-01-01", decidedAt: "2000-01-01T00:00:00Z" }),
    );
    expect(readConsent()).toBeNull();
    renderWith(null);
    expect(screen.getByRole("button", { name: "Aceptar todo" })).toBeInTheDocument();
  });

  it("retirar las estadísticas desde Preferencias borra el identificador de visitante", () => {
    renderWith(<OpenPreferences />);
    fireEvent.click(screen.getByRole("button", { name: "Aceptar todo" }));
    localStorage.setItem("ame_visitor_id", "11111111-1111-4111-8111-111111111111");

    fireEvent.click(screen.getByRole("button", { name: "Preferencias de cookies" }));
    const statistics = screen.getByRole("switch", { name: "Estadísticas" });
    expect(statistics).toHaveAttribute("aria-checked", "true");
    fireEvent.click(statistics);
    fireEvent.click(screen.getByRole("button", { name: "Guardar preferencias" }));

    expect(readConsent()).toMatchObject({ statistics: false, maps: true });
    expect(localStorage.getItem("ame_visitor_id")).toBeNull();
  });
});

describe("registro de visitas según el consentimiento", () => {
  it("sin elección o rechazado registra sin identificador", () => {
    renderWith(<Tracker />);
    expect(trackPageView).toHaveBeenCalledWith("/", { withVisitorId: false });
  });

  it("con estadísticas aceptadas registra con identificador", () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ statistics: true, maps: false, version: PRIVACY_POLICY_VERSION, decidedAt: "2026-10-22T00:00:00Z" }),
    );
    renderWith(<Tracker />);
    expect(trackPageView).toHaveBeenCalledWith("/", { withVisitorId: true });
  });

  it("aceptar en el aviso no vuelve a contar la página actual", () => {
    renderWith(<Tracker />);
    fireEvent.click(screen.getByRole("button", { name: "Aceptar todo" }));
    expect(trackPageView).toHaveBeenCalledTimes(1);
  });
});

describe("mapa", () => {
  it("sin permiso de Mapas lo pide antes de cargar Google", () => {
    const { container } = renderWith(<MapEmbed />);
    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    fireEvent.click(screen.getByRole("button", { name: "Ver mapa" }));
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("dialog", { name: "Permiso para cargar Google Maps" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Aceptar y ver mapa" }));
    expect(container.querySelector('iframe[src*="google.com/maps"]')).not.toBeNull();
    expect(readConsent()).toMatchObject({ maps: true, statistics: false });
  });

  it("con permiso carga el mapa solo tras el clic", () => {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ statistics: false, maps: true, version: PRIVACY_POLICY_VERSION, decidedAt: "2026-10-22T00:00:00Z" }),
    );
    const { container } = renderWith(<MapEmbed />);
    expect(container.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ver mapa" }));
    expect(container.querySelector('iframe[src*="google.com/maps"]')).not.toBeNull();
  });
});
