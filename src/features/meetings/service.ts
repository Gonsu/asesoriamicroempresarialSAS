import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { MutationResult } from "@/lib/mutationResult";
import { deleteImage, uploadImage } from "@/lib/storageImage";
import { fromDateTimeInput, type MeetingFormValues } from "./schema";

export type Meeting = Pick<
  Tables<"meetings">,
  "id" | "title" | "description" | "meeting_date" | "image_path" | "type" | "published" | "created_at"
>;
export type PublicMeeting = Pick<Meeting, "id" | "title" | "description" | "meeting_date" | "image_path" | "type">;

// anon solo puede leer columnas explícitas (created_by no se expone).
const PUBLIC_COLUMNS = "id, title, description, meeting_date, image_path, type";
const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, published, created_at`;

export async function listPublishedMeetings(): Promise<PublicMeeting[]> {
  const { data, error } = await supabase
    .from("meetings")
    .select(PUBLIC_COLUMNS)
    .eq("published", true)
    .order("meeting_date", { ascending: false, nullsFirst: false });
  if (error) throw new Error(`No se pudieron cargar las reuniones: ${error.message}`);
  return data;
}

/** Todas las reuniones, publicadas o no (la RLS solo las devuelve completas a un admin). */
export async function listMeetings(): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from("meetings")
    .select(ADMIN_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar las reuniones: ${error.message}`);
  return data;
}

/**
 * Crea (sin id) o actualiza una reunión. Si hay imagen nueva se sube primero; si luego falla
 * el guardado se borra, y si el guardado funciona se borra la imagen anterior.
 */
export async function saveMeeting(input: {
  id: string | null;
  values: MeetingFormValues;
  previousImage: string | null;
}): Promise<MutationResult> {
  const { id, values, previousImage } = input;
  const imagePath = values.image ? await uploadImage(values.image, "meetings") : null;

  const payload = {
    title: values.title,
    description: values.description || null,
    meeting_date: fromDateTimeInput(values.meetingDate),
    type: values.type,
    published: values.published,
    ...(imagePath && { image_path: imagePath }),
  };
  const { error } = id
    ? await supabase.from("meetings").update(payload).eq("id", id)
    : await supabase.from("meetings").insert(payload);

  if (error) {
    await deleteImage(imagePath);
    throw new Error(`No se pudo guardar la reunión: ${error.message}`);
  }
  return { warning: imagePath ? await deleteImage(previousImage) : null };
}

export async function deleteMeeting(meeting: Pick<Meeting, "id" | "image_path">): Promise<MutationResult> {
  const { error } = await supabase.from("meetings").delete().eq("id", meeting.id);
  if (error) throw new Error(`No se pudo eliminar la reunión: ${error.message}`);
  return { warning: await deleteImage(meeting.image_path) };
}
