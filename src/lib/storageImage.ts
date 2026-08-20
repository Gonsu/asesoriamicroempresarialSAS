import { supabase } from "@/integrations/supabase/client";

const BUCKET = "meeting-images";
const cache = new Map<string, string>();

/**
 * The meeting-images bucket is private: stored URLs (or paths) are converted
 * into short-lived signed URLs before being rendered.
 */
export async function resolveStorageImage(url?: string | null): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("http") && !url.includes(`/${BUCKET}/`)) return url;

  const raw = url.includes(`/${BUCKET}/`) ? url.split(`/${BUCKET}/`).pop()! : url;
  const path = decodeURIComponent(raw.split("?")[0]);
  if (!path) return null;

  const cached = cache.get(path);
  if (cached) return cached;

  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (!data?.signedUrl) return null;
  cache.set(path, data.signedUrl);
  return data.signedUrl;
}

export async function resolveStorageImages<T extends { image_url: string | null }>(
  rows: T[]
): Promise<T[]> {
  return Promise.all(
    rows.map(async (row) => ({ ...row, image_url: await resolveStorageImage(row.image_url) }))
  );
}
