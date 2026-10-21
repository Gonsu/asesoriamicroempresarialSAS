import { readFile } from "node:fs/promises";
import { expect, login, setConsent, test } from "./fixtures";
import { resetRateLimits, sql } from "./helpers/db";
import { DEFAULT_CONTENT } from "../src/features/content/defaults";

/** Fecha local de Bogotá (YYYY-MM-DD) y primer/último día del mes y del año actuales. */
function periods() {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  const [y, m] = today.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, "0");
  return {
    month: { desde: `${y}-${mm}-01`, hasta: `${y}-${mm}-${String(lastDay).padStart(2, "0")}`, file: `reporte-ame-${y}-${mm}.csv` },
    year: { desde: `${y}-01-01`, hasta: `${y}-12-31`, file: `reporte-ame-${y}.csv` },
  };
}

async function expected(range: { desde: string; hasta: string }) {
  const [views] = await sql<{ visitas: string; visitantes_unicos: string }>(
    "select * from public.page_view_totals($1, $2)",
    [range.desde, range.hasta],
  );
  const meetings = await sql<{ total: string; publicadas: string }>("select * from public.meeting_stats($1, $2)", [
    range.desde,
    range.hasta,
  ]);
  const sum = (k: "total" | "publicadas") => meetings.reduce((n, r) => n + Number(r[k]), 0);
  return {
    visitas: String(views.visitas),
    unicos: String(views.visitantes_unicos),
    actividades: String(sum("total")),
    publicadas: String(sum("publicadas")),
  };
}

test.describe("panel administrativo", () => {
  test.beforeEach(async ({ context, page }) => {
    await resetRateLimits();
    await setConsent(context, { statistics: false, maps: false });
    await login(page, "admin");
    await expect(page).toHaveURL("/admin");
  });

  test("las estadísticas coinciden con SQL, sin bots, y el CSV se descarga", async ({ page }) => {
    const card = (label: string) =>
      page.locator("div.bg-card", { has: page.getByText(label, { exact: true }) }).locator("p.text-2xl");
    const { month, year } = periods();

    // Los datos de la preparación global incluyen 2 visitas de bots que no deben contarse.
    const bots = await sql<{ n: string }>("select count(*) as n from public.page_views where public.is_bot_user_agent(user_agent)");
    expect(Number(bots[0].n)).toBeGreaterThan(0);

    for (const [kind, range] of [["month", month], ["year", year]] as const) {
      if (kind === "year") await page.getByLabel("Tipo de período").selectOption("year");
      const want = await expected(range);
      await expect(card("Visitas totales")).toHaveText(want.visitas);
      await expect(card("Visitantes únicos")).toHaveText(want.unicos);
      await expect(card("Total actividades")).toHaveText(want.actividades);
      await expect(card("Publicadas")).toHaveText(want.publicadas);

      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: "Descargar CSV" }).click(),
      ]);
      expect(download.suggestedFilename()).toBe(range.file);
      const csv = await readFile((await download.path())!, "utf8");
      expect(csv.charCodeAt(0)).toBe(0xfeff);
      expect(csv).toContain(`Visitas a la página (sin bots);${want.visitas}\r\n`);
    }
  });

  test("crear y borrar una reunión, con validación y confirmación", async ({ page }) => {
    const title = `E2E Reunión ${Date.now()}`;
    await page.getByRole("button", { name: "Reuniones" }).click();
    await page.getByRole("button", { name: "Nueva" }).click();
    await page.getByRole("button", { name: "Crear" }).click();
    await expect(page.getByText("El título es obligatorio.")).toBeVisible();

    await page.getByLabel("Título").fill(title);
    await page.getByLabel("Descripción").fill("Creada por la prueba automatizada.");
    await page.getByLabel("Fecha").fill("2026-10-25T15:30");
    await page.getByLabel("Publicado (visible para clientes)").click();
    await page.getByRole("button", { name: "Crear" }).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    const visitor = await page.context().newPage();
    await visitor.goto("/reuniones");
    await expect(visitor.getByRole("heading", { name: title })).toBeVisible();
    await expect(visitor.getByText("25 de octubre de 2026")).toBeVisible();

    await page.getByRole("button", { name: `Eliminar "${title}"` }).click();
    const dialog = page.getByRole("alertdialog");
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await page.getByRole("button", { name: `Eliminar "${title}"` }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByRole("heading", { name: title })).toHaveCount(0);

    await visitor.reload();
    await expect(visitor.getByRole("heading", { name: "Reuniones y Asesorías" }).first()).toBeVisible();
    await expect(visitor.getByRole("heading", { name: title })).toHaveCount(0);
    await visitor.close();
  });

  test("el editor de contenido cambia el sitio", async ({ page }) => {
    const original = DEFAULT_CONTENT.cta.title;
    await page.getByRole("button", { name: "Contenido" }).click();
    const ctaTitle = page.locator("#cta-title");
    const save = page.locator("form", { has: ctaTitle }).getByRole("button", { name: "Guardar" });

    await ctaTitle.fill("");
    await save.click();
    await expect(page.getByText("El título es obligatorio.")).toBeVisible();

    await ctaTitle.fill("Título CTA de prueba E2E");
    await save.click();
    await expect(page.getByText("actualizada.").first()).toBeVisible();
    const visitor = await page.context().newPage();
    try {
      await visitor.goto("/");
      await expect(visitor.getByRole("heading", { name: "Título CTA de prueba E2E" })).toBeVisible();
    } finally {
      await visitor.close();
      await sql("update public.site_content set title = $1 where section_key = 'cta'", [original]);
    }
  });

  test("los mensajes muestran la autorización y se pueden marcar y borrar", async ({ page }) => {
    await sql("delete from public.contact_messages");
    await sql(
      `insert into public.contact_messages (name, email, message, privacy_accepted_at, privacy_version)
       values ('María Gómez', 'maria@correo.co', 'Hola <b>gracias</b>, quiero información.', now(), '2026-10-22')`,
    );
    await page.getByRole("button", { name: "Mensajes" }).click();
    await expect(page.getByRole("heading", { name: "María Gómez" })).toBeVisible();
    await expect(page.getByText("<b>gracias</b>", { exact: false })).toBeVisible();
    await expect(page.getByText(/Autorizó el tratamiento de datos el .*política versión 2026-10-22/)).toBeVisible();
    await expect(page.getByText("1 sin leer")).toBeVisible();
    await page.getByRole("button", { name: "Marcar como leído el mensaje de María Gómez" }).click();
    await expect(page.getByText("0 sin leer")).toBeVisible();
    await page.getByRole("button", { name: "Eliminar el mensaje de María Gómez" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Eliminar" }).click();
    await expect(page.getByText("No hay mensajes aún.")).toBeVisible();
  });
});
