import { expect, login, setConsent, test } from "./fixtures";
import { e2eEnv, USERS } from "./helpers/env";

test.describe("acceso al panel", () => {
  test.beforeEach(async ({ context }) => {
    await setConsent(context, { statistics: false, maps: false });
  });

  test("sin sesión, /admin redirige a /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Panel Administrativo" })).toBeVisible();
  });

  test("el login valida los campos en español", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page.getByText("Escribe tu correo.")).toBeVisible();
    await expect(page.getByText("Escribe tu contraseña.")).toBeVisible();
  });

  test.describe("con credenciales incorrectas", () => {
    // Supabase responde 400 al login fallido.
    test.use({ allowedConsoleErrors: [/status of 400/] });
    test("muestra el error y no entra", async ({ page }) => {
      await page.goto("/login");
      await page.getByLabel("Correo electrónico").fill(USERS.admin.email);
      await page.getByLabel("Contraseña").fill("incorrecta-123");
      await page.getByRole("button", { name: "Iniciar sesión" }).click();
      await expect(page.getByText("Credenciales incorrectas", { exact: false }).first()).toBeVisible();
      await expect(page).toHaveURL("/login");
    });
  });

  test("un usuario sin rol admin no entra al panel", async ({ page }) => {
    await login(page, "normal");
    await expect(page.getByText("no tiene permisos de administrador")).toBeVisible();
    await page.goto("/admin");
    await expect(page).toHaveURL("/login");
  });

  test("el admin entra y puede salir", async ({ page }) => {
    await login(page, "admin");
    await expect(page).toHaveURL("/admin");
    await expect(page.getByRole("heading", { name: /Panel Admin/ })).toBeVisible();
    await page.getByRole("button", { name: "Salir" }).click();
    await expect(page).toHaveURL("/");
    expect(await page.evaluate(() => localStorage.getItem("ame_admin_last_activity"))).toBeNull();
    await page.goto("/admin");
    await expect(page).toHaveURL("/login");
  });
});

test.describe("autorización en el servidor (RLS), sin pasar por el frontend", () => {
  const rest = (path: string, init: RequestInit & { token?: string } = {}) => {
    const { apiUrl, publishableKey } = e2eEnv();
    return fetch(`${apiUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: publishableKey,
        ...(init.token && { Authorization: `Bearer ${init.token}` }),
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  };

  async function tokenFor(user: keyof typeof USERS) {
    const { apiUrl, publishableKey } = e2eEnv();
    const res = await fetch(`${apiUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: publishableKey, "Content-Type": "application/json" },
      body: JSON.stringify(USERS[user]),
    });
    expect(res.ok).toBe(true);
    return ((await res.json()) as { access_token: string }).access_token;
  }

  test("anon no lee mensajes, visitas ni roles, ni inserta mensajes", async () => {
    for (const table of ["contact_messages", "page_views", "user_roles"]) {
      expect((await rest(`${table}?select=*`)).status, table).toBe(401);
    }
    const insert = await rest("contact_messages", {
      method: "POST",
      body: JSON.stringify({ name: "x", email: "x@x.co", message: "mensaje directo sin Turnstile" }),
    });
    expect(insert.status).toBe(401);
  });

  test("un usuario sin rol no ve datos privados ni puede darse el rol admin", async () => {
    const token = await tokenFor("normal");
    for (const table of ["contact_messages", "page_views"]) {
      const res = await rest(`${table}?select=id`, { token });
      expect(res.status, table).toBe(200);
      expect(await res.json(), table).toEqual([]);
    }
    const drafts = await rest("meetings?select=id&published=is.false", { token });
    expect(await drafts.json()).toEqual([]);
    const role = await rest("user_roles", {
      method: "POST",
      token,
      body: JSON.stringify({ user_id: "00000000-0000-0000-0000-000000000000", role: "admin" }),
    });
    expect(role.status).toBe(403);
    const content = await rest("site_content?section_key=eq.cta", {
      method: "PATCH",
      token,
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ title: "hack" }),
    });
    expect(await content.json()).toEqual([]);
  });
});
