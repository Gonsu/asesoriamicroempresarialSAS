import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { clearVisitorId } from "@/features/analytics/tracking";
import { readConsent, writeConsent, type ConsentChoices, type StoredConsent } from "./consent";
import { ConsentContext, type ConsentContextType } from "./consent-context";

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsent] = useState<StoredConsent | null>(() => readConsent());
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Al cerrar el aviso, el foco vuelve a quien lo abrió (p. ej. el enlace del pie) o al contenido.
  const returnFocus = useRef<HTMLElement | null>(null);

  const restoreFocus = useCallback(() => {
    const target = returnFocus.current ?? document.getElementById("contenido");
    returnFocus.current = null;
    requestAnimationFrame(() => target?.focus());
  }, []);

  const save = useCallback((choices: ConsentChoices) => {
    // Retirar el consentimiento de estadísticas borra el identificador ya guardado.
    if (!choices.statistics) clearVisitorId();
    setConsent(writeConsent(choices));
    setSettingsOpen(false);
    restoreFocus();
  }, [restoreFocus]);

  const value = useMemo<ConsentContextType>(
    () => ({
      consent,
      statistics: consent?.statistics ?? false,
      maps: consent?.maps ?? false,
      bannerOpen: consent === null || settingsOpen,
      settingsOpen,
      save,
      acceptAll: () => save({ statistics: true, maps: true }),
      rejectAll: () => save({ statistics: false, maps: false }),
      allow: (category) =>
        save({ statistics: consent?.statistics ?? false, maps: consent?.maps ?? false, [category]: true }),
      openSettings: () => {
        if (consent && document.activeElement instanceof HTMLElement) returnFocus.current = document.activeElement;
        setSettingsOpen(true);
      },
      closeSettings: () => {
        setSettingsOpen(false);
        if (consent) restoreFocus();
      },
    }),
    [consent, settingsOpen, save, restoreFocus],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};
