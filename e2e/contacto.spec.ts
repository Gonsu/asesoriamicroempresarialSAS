import { expect, POLICY_VERSION, setConsent, test } from "./fixtures";
import { resetRateLimits, sql } from "./helpers/db";
import { e2eEnv } from "./helpers/env";

/** Token que genera la clave de prueba de Turnstile; la secreta de prueba lo acepta siempre. */
const TEST_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";
const ORIGIN = "http://localhost:4173";

const valid = {
  name: "Ana Pérez",
  email: "ana@correo.co",
  message: "Quisiera información sobre la asesoría financiera.",
  privacyAccepted: true,
  privacyVersion: POLICY_VERSION,
  token: TEST_TOKEN,
};

const callFunction = (body: unknown, origin = ORIGIN) =>
  fetch(`${e2eEnv().apiUrl}/functions/v1/contact`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

test.describe("formulario de contacto", () => {
  test.beforeEach(async ({ context }) => {
    await resetRateLimits();
    await sql("delete from public.contact_messages");
    await setConsent(context, { statistics: false, maps: false });
  });

  test("valida en español, exige la autorización y guarda el mensaje con su prueba", async ({ page }) => {
    await page.goto("/contacto");
    const submit = page.getByRole("button", { name: "Enviar mensaje" });
    // Turnstile (clave de prueba) habilita el envío.
    await expect(submit).toBeEnabled({ timeout: 30_000 });

    await submit.click();
    await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
    await expect(page.getByText("Debes autorizar el tratamiento de tus datos personales.")).toBeVisible();

    await page.getByLabel("Nombre").fill(valid.name);
    await page.getByLabel("Correo").fill(valid.email);
    await page.getByLabel("Mensaje").fill(valid.message);
    await page.getByRole("checkbox", { name: /Autorizo a/ }).check();
    await submit.click();
    await expect(page.getByText("¡Gracias! Recibimos tu mensaje.")).toBeVisible();

    const rows = await sql<{ name: string; privacy_version: string; privacy_accepted_at: Date | null }>(
      "select name, privacy_version, privacy_accepted_at from public.contact_messages",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: valid.name, privacy_version: POLICY_VERSION });
    expect(rows[0].privacy_accepted_at).not.toBeNull();
  });

  test.describe("sin Turnstile", () => {
    test.use({ allowedConsoleErrors: [/ERR_FAILED|Failed to load resource/] });
    test("no se puede enviar y lo avisa", async ({ page }) => {
      await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
      await page.goto("/contacto");
      await expect(page.getByText("No se pudo cargar la verificación anti-spam")).toBeVisible();
      await expect(page.getByRole("button", { name: "Enviar mensaje" })).toBeDisabled();
    });
  });
});

test.describe("Edge Function contact", () => {
  test.beforeEach(async () => {
    await resetRateLimits();
    await sql("delete from public.contact_messages");
  });

  test("rechaza otro origen, la falta de autorización y datos inválidos", async () => {
    expect((await callFunction(valid, "https://evil.example")).status).toBe(403);
    expect((await callFunction({ ...valid, privacyAccepted: false })).status).toBe(400);
    expect((await callFunction({ ...valid, email: "no-es-correo" })).status).toBe(400);
    expect((await callFunction({ ...valid, token: "" })).status).toBe(400);
    expect(await sql("select 1 from public.contact_messages")).toHaveLength(0);
  });

  test("limita a 5 mensajes por hora por IP", async () => {
    for (let i = 1; i <= 5; i++) expect((await callFunction(valid)).status, `envío ${i}`).toBe(201);
    const blocked = await callFunction(valid);
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({ error: "Has enviado demasiados mensajes. Inténtalo de nuevo en una hora." });
    expect(await sql("select 1 from public.contact_messages")).toHaveLength(5);
  });
});
