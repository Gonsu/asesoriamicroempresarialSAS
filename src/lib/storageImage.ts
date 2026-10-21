import { getSupabase, SUPABASE_URL } from "@/integrations/supabase/client";

/**
 * Imágenes del sitio en el bucket público `site-images`. En la base de datos se guarda solo
 * la ruta del archivo (p. ej. `meetings/<uuid>.webp`); la URL pública se arma al mostrarla.
 * Los límites coinciden con los del bucket (ver la migración del esquema inicial).
 */
const BUCKET = "site-images";

export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_ACCEPT = IMAGE_TYPES.join(",");

const EXTENSIONS: Record<(typeof IMAGE_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ImageFolder = "meetings" | "testimonials" | "content";

export function imageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  // Misma URL que getPublicUrl(), sin cargar supabase-js en las páginas públicas.
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

/** Devuelve un mensaje de error si el archivo no cumple los límites del bucket. */
export function validateImage(file: File): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Formato no permitido. Usa JPG, PNG o WebP.";
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return "La imagen supera los 2 MB.";
  }
  return null;
}

/** Sube la imagen y devuelve su ruta en el bucket. Lanza un Error con mensaje para el usuario. */
export async function uploadImage(file: File, folder: ImageFolder): Promise<string> {
  const supabase = await getSupabase();
  const invalid = validateImage(file);
  if (invalid) throw new Error(invalid);

  const ext = EXTENSIONS[file.type as (typeof IMAGE_TYPES)[number]];
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);
  return path;
}

/**
 * Borra una imagen del bucket. Un fallo solo deja un archivo huérfano, así que no se lanza:
 * devuelve un aviso para mostrar al usuario, o null si se borró (o no había imagen).
 */
export async function deleteImage(path: string | null | undefined): Promise<string | null> {
  const supabase = await getSupabase();
  if (!path) return null;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return error ? `No se pudo borrar la imagen del almacenamiento (${error.message}); quedó como archivo sin usar.` : null;
}
