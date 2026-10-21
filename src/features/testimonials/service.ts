import { getSupabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { MutationResult } from "@/lib/mutationResult";
import { deleteImage, uploadImage } from "@/lib/storageImage";
import type { TestimonialFormValues } from "./schema";

export type Testimonial = Pick<
  Tables<"testimonials">,
  "id" | "name" | "business_type" | "content" | "image_path" | "is_published" | "created_at"
>;
export type PublicTestimonial = Pick<Testimonial, "id" | "name" | "business_type" | "content" | "image_path">;

// anon solo puede leer columnas explícitas.
const PUBLIC_COLUMNS = "id, name, business_type, content, image_path";
const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, is_published, created_at`;

export async function listPublishedTestimonials(): Promise<PublicTestimonial[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("testimonials")
    .select(PUBLIC_COLUMNS)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los testimonios: ${error.message}`);
  return data;
}

/** Todos los testimonios, publicados o no (la RLS solo los devuelve completos a un admin). */
export async function listTestimonials(): Promise<Testimonial[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("testimonials")
    .select(ADMIN_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudieron cargar los testimonios: ${error.message}`);
  return data;
}

/**
 * Crea (sin id) o actualiza un testimonio. Si hay imagen nueva se sube primero; si luego falla
 * el guardado se borra, y si el guardado funciona se borra la imagen anterior.
 */
export async function saveTestimonial(input: {
  id: string | null;
  values: TestimonialFormValues;
  previousImage: string | null;
}): Promise<MutationResult> {
  const supabase = await getSupabase();
  const { id, values, previousImage } = input;
  const imagePath = values.image ? await uploadImage(values.image, "testimonials") : null;

  const payload = {
    name: values.name,
    business_type: values.businessType || null,
    content: values.content,
    is_published: values.isPublished,
    ...(imagePath && { image_path: imagePath }),
  };
  const { error } = id
    ? await supabase.from("testimonials").update(payload).eq("id", id)
    : await supabase.from("testimonials").insert(payload);

  if (error) {
    await deleteImage(imagePath);
    throw new Error(`No se pudo guardar el testimonio: ${error.message}`);
  }
  return { warning: imagePath ? await deleteImage(previousImage) : null };
}

export async function setTestimonialPublished(input: { id: string; isPublished: boolean }): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("testimonials")
    .update({ is_published: input.isPublished })
    .eq("id", input.id);
  if (error) throw new Error(`No se pudo cambiar la publicación: ${error.message}`);
}

export async function deleteTestimonial(item: Pick<Testimonial, "id" | "image_path">): Promise<MutationResult> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("testimonials").delete().eq("id", item.id);
  if (error) throw new Error(`No se pudo eliminar el testimonio: ${error.message}`);
  return { warning: await deleteImage(item.image_path) };
}
