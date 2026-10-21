/** Resultado de una operación que terminó bien pero puede traer un aviso (p. ej. imagen sin borrar). */
export interface MutationResult {
  warning: string | null;
}
