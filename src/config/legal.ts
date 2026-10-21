// Datos de las páginas legales. Los valores "[COMPLETAR]" los debe llenar la empresa y
// revisar un abogado antes de publicar (ver docs/lanzamiento.md).

/**
 * Versión de la política de tratamiento de datos = su fecha (AAAA-MM-DD). Al cambiarla:
 * el aviso de cookies vuelve a pedir consentimiento y los mensajes nuevos guardan la nueva
 * versión como prueba de la autorización.
 */
export const PRIVACY_POLICY_VERSION = "2026-10-22";

export const legal = {
  nit: "[COMPLETAR: NIT con dígito de verificación]",
  /** Área o persona que atiende consultas y reclamos de datos personales. */
  dataOfficer: "[COMPLETAR: área o cargo responsable de atender consultas y reclamos]",
  /** Fecha desde la que rige la política (texto, p. ej. "22 de octubre de 2026"). */
  effectiveDate: "[COMPLETAR: fecha de entrada en vigencia]",
  /** Ciudad cuyos jueces resuelven controversias de los términos de uso. */
  jurisdictionCity: "[COMPLETAR: ciudad, p. ej. Cúcuta]",
  termsUpdated: "[COMPLETAR: fecha de la última actualización de los términos]",
} as const;

/** Plazos de conservación. Deben coincidir con la migración 20261023000000_legal.sql. */
export const retention = {
  contactMessagesMonths: 12,
  pageViewsMonths: 24,
  rateLimitHours: 2,
} as const;

/** Dónde guarda los datos Supabase (región del proyecto). */
export const dataLocation = "Estados Unidos (región us-west-2, Oregón)";
