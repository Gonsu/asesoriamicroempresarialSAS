import { PRIVACY_POLICY_VERSION } from "@/config/legal";

/** Categorías opcionales. Lo necesario (sesión, esta preferencia, Turnstile) no se pregunta. */
export interface ConsentChoices {
  /** Identificador anónimo de visitante para contar visitantes únicos. */
  statistics: boolean;
  /** Cargar Google Maps en Contacto. */
  maps: boolean;
}

export interface StoredConsent extends ConsentChoices {
  /** Versión de la política vigente cuando se eligió. */
  version: string;
  /** Fecha y hora de la elección (ISO). */
  decidedAt: string;
}

export const CONSENT_KEY = "ame_consent";

/** La elección guardada, o null si no hay o es de otra versión de la política. */
export function readConsent(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredConsent>;
    if (
      value.version !== PRIVACY_POLICY_VERSION ||
      typeof value.statistics !== "boolean" ||
      typeof value.maps !== "boolean" ||
      typeof value.decidedAt !== "string"
    ) {
      return null;
    }
    return value as StoredConsent;
  } catch {
    return null;
  }
}

export function writeConsent(choices: ConsentChoices, now = new Date()): StoredConsent {
  const consent: StoredConsent = { ...choices, version: PRIVACY_POLICY_VERSION, decidedAt: now.toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    // Sin localStorage la elección dura lo que dure la pestaña.
  }
  return consent;
}
