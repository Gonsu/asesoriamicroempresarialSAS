import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PRIVACY_POLICY_VERSION } from "@/config/legal";
import type { ContactFormValues } from "./schema";

export type ContactMessage = Tables<"contact_messages">;

/**
 * Envía el formulario a la Edge Function `contact`, que verifica Turnstile y el límite por
 * IP. La tabla no admite inserciones directas desde el navegador.
 */
export async function sendContactMessage(values: ContactFormValues, turnstileToken: string): Promise<void> {
  const { error } = await supabase.functions.invoke("contact", {
    // privacyVersion queda guardada con el mensaje como prueba de la autorización.
    body: { ...values, privacyVersion: PRIVACY_POLICY_VERSION, token: turnstileToken },
  });
  if (!error) return;

  // La función responde { error: "mensaje para el usuario" } con el código HTTP.
  if (error instanceof FunctionsHttpError) {
    const body = (await error.context.json().catch(() => null)) as { error?: unknown } | null;
    if (typeof body?.error === "string") throw new Error(body.error);
  }
  throw new Error("No se pudo enviar el mensaje. Revisa tu conexión e inténtalo de nuevo.");
}

/** Mensajes recibidos, del más reciente al más antiguo (la RLS solo los muestra a admins). */
export async function listContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, is_read, created_at, privacy_accepted_at, privacy_version")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los mensajes: ${error.message}`);
  return data;
}

export async function setContactMessageRead(input: { id: string; isRead: boolean }): Promise<void> {
  const { error } = await supabase.from("contact_messages").update({ is_read: input.isRead }).eq("id", input.id);
  if (error) throw new Error(`No se pudo actualizar el mensaje: ${error.message}`);
}

export async function deleteContactMessage(id: string): Promise<void> {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) throw new Error(`No se pudo eliminar el mensaje: ${error.message}`);
}
