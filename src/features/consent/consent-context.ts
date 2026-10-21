import { createContext } from "react";
import type { ConsentChoices, StoredConsent } from "./consent";

export interface ConsentContextType {
  /** null mientras la persona no haya elegido (o si cambió la versión de la política). */
  consent: StoredConsent | null;
  /** Atajos: false mientras no haya elegido. */
  statistics: boolean;
  maps: boolean;
  /** El aviso está visible y, si settingsOpen, con las casillas por categoría. */
  bannerOpen: boolean;
  settingsOpen: boolean;
  save: (choices: ConsentChoices) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  /** Activa una sola categoría sin tocar la otra (p. ej. "Aceptar y ver mapa"). */
  allow: (category: keyof ConsentChoices) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

export const ConsentContext = createContext<ConsentContextType | undefined>(undefined);
