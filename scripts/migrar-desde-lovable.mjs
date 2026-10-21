#!/usr/bin/env node
// Migra datos e imágenes del proyecto Supabase administrado por Lovable Cloud al proyecto
// propio. Dos fases, para poder revisar lo exportado antes de importarlo:
//
//   node scripts/migrar-desde-lovable.mjs export   -> migracion/datos.json + migracion/imagenes/
//   node scripts/migrar-desde-lovable.mjs import   -> sube imágenes y filas al proyecto nuevo
//   node scripts/migrar-desde-lovable.mjs import --sin-secciones   -> igual, sin site_content
//
// Variables de entorno (ver docs/supabase.md):
//   export: OLD_SUPABASE_URL, OLD_SUPABASE_KEY (clave anon/publishable del proyecto viejo)
//           Para exportar también borradores y visitas, una sesión de admin del proyecto
//           viejo (opcional; sin ella solo se exporta lo publicado):
//             OLD_ACCESS_TOKEN (access_token de una sesión iniciada con Google en el sitio
//             viejo; dura ~1 hora), o bien OLD_ADMIN_EMAIL y OLD_ADMIN_PASSWORD
//   import: NEW_SUPABASE_URL, NEW_SUPABASE_SECRET_KEY (secret/service_role del proyecto
//           nuevo; nunca la pongas en .env ni en el frontend)

import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

const OUT_DIR = "migracion";
const DATA_FILE = path.join(OUT_DIR, "datos.json");
const IMG_DIR = path.join(OUT_DIR, "imagenes");
const OLD_BUCKET = "meeting-images";
const NEW_BUCKET = "site-images";
const MAX_BYTES = 2 * 1024 * 1024;
const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function env(name, { optional = false } = {}) {
  const value = process.env[name];
  if (!value && !optional) {
    console.error(`Falta la variable de entorno ${name}.`);
    process.exit(1);
  }
  return value;
}

const client = (url, key, accessToken) =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(accessToken && { global: { headers: { Authorization: `Bearer ${accessToken}` } } }),
  });

// Lee todas las filas de una tabla en páginas de 1000 (límite por petición de Supabase).
async function fetchAll(db, table) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select("*").range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

// Extrae la ruta dentro del bucket de una URL pública o firmada (o de una ruta suelta).
function oldPath(imageUrl) {
  if (!imageUrl) return null;
  const marker = `/${OLD_BUCKET}/`;
  const raw = imageUrl.includes(marker) ? imageUrl.split(marker).pop() : imageUrl;
  return decodeURIComponent(raw.split("?")[0]) || null;
}

async function exportData() {
  const url = env("OLD_SUPABASE_URL").replace(/\/+$/, "");
  const key = env("OLD_SUPABASE_KEY");
  const token = env("OLD_ACCESS_TOKEN", { optional: true });
  if (token && !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) {
    throw new Error("OLD_ACCESS_TOKEN no parece un token (¿el portapapeles tenía otra cosa?). Cópialo de nuevo.");
  }
  const email = env("OLD_ADMIN_EMAIL", { optional: true });
  const password = env("OLD_ADMIN_PASSWORD", { optional: true });
  const db = client(url, key, token);

  const isAdmin = Boolean(token || (email && password));
  if (token) {
    const { data, error } = await db.auth.getUser(token);
    if (error) throw new Error(`OLD_ACCESS_TOKEN no es válido o expiró: ${error.message}`);
    console.log(`Sesión de ${data.user.email}: se exportan también borradores y visitas.`);
  } else if (isAdmin) {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`Login en el proyecto viejo: ${error.message}`);
    console.log(`Sesión iniciada como ${email}: se exportan también borradores y visitas.`);
  } else {
    console.log("Sin sesión de admin: solo contenido publicado, sin visitas.");
  }

  // Con una cuenta sin rol admin RLS devolvería solo lo publicado, sin avisar.
  if (isAdmin) {
    const { data: auth } = await db.auth.getUser(token);
    const { data: admin, error } = await db.rpc("is_admin", { _user_id: auth.user.id });
    if (error || !admin) {
      throw new Error(`La cuenta ${auth.user.email} no es admin en el proyecto viejo; usa la cuenta admin.`);
    }
  }

  const data = {
    exported_at: new Date().toISOString(),
    complete: isAdmin,
    meetings: await fetchAll(db, "meetings"),
    testimonials: await fetchAll(db, "testimonials"),
    site_content: await fetchAll(db, "site_content"),
    page_views: isAdmin ? await fetchAll(db, "page_views") : [],
  };

  await mkdir(IMG_DIR, { recursive: true });
  const folders = { meetings: "meetings", testimonials: "testimonials", site_content: "content" };
  let ok = 0;
  let failed = 0;

  for (const [table, folder] of Object.entries(folders)) {
    for (const row of data[table]) {
      const source = oldPath(row.image_url);
      row.image_path = null;
      if (!source) continue;

      // El bucket viejo es público: la URL pública funciona con o sin sesión.
      const res = await fetch(`${url}/storage/v1/object/public/${OLD_BUCKET}/${encodeURI(source)}`);
      if (!res.ok) {
        console.warn(`  ✗ ${table} ${row.id}: no se pudo descargar ${source} (HTTP ${res.status})`);
        failed++;
        continue;
      }
      const type = (res.headers.get("content-type") ?? "").split(";")[0];
      const ext = EXTENSIONS[type] ?? (path.extname(source).slice(1).toLowerCase() || "bin");
      row.image_path = `${folder}/${randomUUID()}.${ext}`;
      row.image_type = type;
      const file = path.join(IMG_DIR, row.image_path);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
      ok++;
    }
  }

  await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(
    `Exportado a ${DATA_FILE}: ${data.meetings.length} reuniones, ${data.testimonials.length} testimonios, ` +
      `${data.site_content.length} secciones, ${data.page_views.length} visitas; ` +
      `${ok} imágenes descargadas, ${failed} fallidas.`,
  );
}

async function importData() {
  const db = client(env("NEW_SUPABASE_URL"), env("NEW_SUPABASE_SECRET_KEY"));
  const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
  const problems = [];

  // Sube la imagen de una fila; si no cumple los límites del bucket la fila queda sin imagen.
  async function uploadImage(table, row) {
    if (!row.image_path) return null;
    const type = row.image_type;
    const bytes = await readFile(path.join(IMG_DIR, row.image_path));
    if (!EXTENSIONS[type] || bytes.length > MAX_BYTES) {
      problems.push(`${table} ${row.id}: imagen omitida (${type || "tipo desconocido"}, ${bytes.length} bytes)`);
      return null;
    }
    const { error } = await db.storage
      .from(NEW_BUCKET)
      .upload(row.image_path, bytes, { contentType: type, cacheControl: "31536000", upsert: true });
    if (error) {
      problems.push(`${table} ${row.id}: ${error.message}`);
      return null;
    }
    return row.image_path;
  }

  // Fila por fila para que un registro inválido no tumbe la importación entera.
  async function upsertRows(table, rows, toRecord, onConflict = "id") {
    let ok = 0;
    for (const row of rows) {
      const record = toRecord(row, await uploadImage(table, row));
      const { error } = await db.from(table).upsert(record, { onConflict });
      if (error) problems.push(`${table} ${row.id}: ${error.message}`);
      else ok++;
    }
    console.log(`${table}: ${ok}/${rows.length} importadas`);
  }

  await upsertRows("meetings", data.meetings, (r, image_path) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    meeting_date: r.meeting_date,
    type: r.type,
    published: r.published,
    image_path,
    created_at: r.created_at,
  }));

  await upsertRows("testimonials", data.testimonials, (r, image_path) => ({
    id: r.id,
    name: r.name,
    business_type: r.business_type,
    content: r.content,
    is_published: r.is_published,
    image_path,
    created_at: r.created_at,
  }));

  // Por section_key: reemplaza las secciones de ejemplo del seed si ya existen.
  // --sin-secciones las omite (p. ej. si son los textos por defecto y se usa el seed).
  const sections = process.argv.includes("--sin-secciones") ? [] : data.site_content;
  await upsertRows(
    "site_content",
    sections,
    (r, image_path) => ({
      section_key: r.section_key,
      title: r.title,
      subtitle: r.subtitle,
      description: r.description,
      extra_data: r.extra_data ?? {},
      image_path,
    }),
    "section_key",
  );

  for (let i = 0; i < data.page_views.length; i += 500) {
    const chunk = data.page_views.slice(i, i + 500).map((r) => ({
      id: r.id,
      page: r.page,
      visitor_id: r.visitor_id,
      user_agent: r.user_agent,
      created_at: r.created_at,
    }));
    const { error } = await db.from("page_views").upsert(chunk, { onConflict: "id" });
    if (error) problems.push(`page_views ${i}-${i + chunk.length}: ${error.message}`);
  }
  console.log(`page_views: ${data.page_views.length} procesadas`);

  if (problems.length) {
    console.warn(`\n${problems.length} problemas:`);
    for (const p of problems) console.warn(`  - ${p}`);
    process.exitCode = 1;
  } else {
    console.log("\nImportación completa sin errores.");
  }
}

const command = process.argv[2];
if (command === "export") await exportData();
else if (command === "import") await importData();
else {
  console.error("Uso: node scripts/migrar-desde-lovable.mjs export|import");
  process.exit(1);
}
