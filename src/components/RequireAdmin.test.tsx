import { act, render, renderHook, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { AuthContext, type AuthContextType } from "@/contexts/auth-context";
import { ADMIN_IDLE_TIMEOUT_MS, markAdminActivity, useIdleLogout } from "@/hooks/useIdleLogout";
import RequireAdmin from "./RequireAdmin";

const auth = (overrides: Partial<AuthContextType>): AuthContextType => ({
  user: null,
  session: null,
  isAdmin: false,
  loading: false,
  signIn: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const LoginProbe = () => {
  const state = useLocation().state as { reason?: string } | null;
  return <p>login:{state?.reason}</p>;
};

const renderAdmin = (value: AuthContextType) =>
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/login" element={<LoginProbe />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <p>panel</p>
              </RequireAdmin>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

const admin = { id: "u1", email: "a@b.co" } as User;

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});
afterEach(() => vi.useRealTimers());

describe("RequireAdmin", () => {
  it("muestra carga mientras se resuelve la sesión", () => {
    renderAdmin(auth({ loading: true }));
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    expect(screen.queryByText("panel")).toBeNull();
  });

  it("manda a /login sin sesión o sin rol admin", () => {
    renderAdmin(auth({}));
    expect(screen.getByText("login:required")).toBeInTheDocument();
  });

  it("no muestra el panel a un usuario sin rol admin", () => {
    renderAdmin(auth({ user: admin, isAdmin: false }));
    expect(screen.queryByText("panel")).toBeNull();
  });

  it("muestra el panel al admin y cierra la sesión tras 30 minutos sin actividad", async () => {
    markAdminActivity();
    const value = auth({ user: admin, isAdmin: true });
    renderAdmin(value);
    expect(screen.getByText("panel")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(ADMIN_IDLE_TIMEOUT_MS + 20_000);
    });
    expect(value.signOut).toHaveBeenCalledTimes(1);
    expect(screen.getByText("login:idle")).toBeInTheDocument();
  });
});

describe("useIdleLogout", () => {
  it("la actividad reinicia el plazo", () => {
    const onIdle = vi.fn();
    renderHook(() => useIdleLogout(onIdle, { timeoutMs: 60_000 }));
    act(() => vi.advanceTimersByTime(45_000));
    act(() => {
      window.dispatchEvent(new Event("keydown"));
    });
    act(() => vi.advanceTimersByTime(45_000));
    expect(onIdle).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(30_000));
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("cierra de inmediato si la última actividad guardada ya venció", () => {
    localStorage.setItem("ame_admin_last_activity", String(Date.now() - 2 * 60_000));
    const onIdle = vi.fn();
    renderHook(() => useIdleLogout(onIdle, { timeoutMs: 60_000 }));
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("no hace nada si está desactivado", () => {
    const onIdle = vi.fn();
    renderHook(() => useIdleLogout(onIdle, { enabled: false, timeoutMs: 1_000 }));
    act(() => vi.advanceTimersByTime(60_000));
    expect(onIdle).not.toHaveBeenCalled();
  });
});
