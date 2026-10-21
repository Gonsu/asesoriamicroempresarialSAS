import { useCallback, useMemo, useState, type ReactNode } from "react";
import { clearVisitorId } from "@/features/analytics/tracking";
import { readConsent, writeConsent, type ConsentChoices, type StoredConsent } from "./consent";
import { ConsentContext, type ConsentContextType } from "./consent-context";

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsent] = useState<StoredConsent | null>(() => readConsent());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const save = useCallback((choices: ConsentChoices) => {
    // Retirar el consentimiento de estadísticas borra el identificador ya guardado.
    if (!choices.statistics) clearVisitorId();
    setConsent(writeConsent(choices));
    setSettingsOpen(false);
  }, []);

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
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    }),
    [consent, settingsOpen, save],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
};
