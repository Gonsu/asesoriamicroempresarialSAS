import { describe, expect, it } from "vitest";
import { loginSchema } from "./auth/schema";
import { contactSchema } from "./contact/schema";
import { sectionSchema } from "./content/schema";
import { emptyMeeting, fromDateTimeInput, meetingSchema, toDateTimeInput } from "./meetings/schema";
import { emptyTestimonial, testimonialSchema } from "./testimonials/schema";

/** Mensajes de error por campo. */
const errorsOf = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  Object.fromEntries((result.error?.issues ?? []).map((i) => [String(i.path[0]), i.message]));

const file = (type: string, size: number) => new File([new Uint8Array(size)], "foto", { type });

describe("loginSchema", () => {
  it("pide correo válido y contraseña", () => {
    expect(errorsOf(loginSchema.safeParse({ email: "", password: "" }))).toEqual({
      email: "Escribe tu correo.",
      password: "Escribe tu contraseña.",
    });
    expect(errorsOf(loginSchema.safeParse({ email: "admin@", password: "x" }))).toEqual({
      email: "El correo no es válido.",
    });
    expect(loginSchema.safeParse({ email: " admin@ame.com ", password: "x" }).data?.email).toBe("admin@ame.com");
  });
});

describe("contactSchema", () => {
  it("valida nombre, correo y largo del mensaje", () => {
    expect(
      errorsOf(contactSchema.safeParse({ name: " ", email: "x", message: "hola", privacyAccepted: false })),
    ).toEqual({
      name: "Escribe tu nombre.",
      email: "El correo no es válido.",
      message: "El mensaje debe tener al menos 10 caracteres.",
      privacyAccepted: "Debes autorizar el tratamiento de tus datos personales.",
    });
    const ok = { name: "Ana", email: "a@b.co", privacyAccepted: true };
    expect(errorsOf(contactSchema.safeParse({ ...ok, message: "x".repeat(2001) }))).toEqual({
      message: "Máximo 2000 caracteres.",
    });
    expect(contactSchema.safeParse({ ...ok, message: "x".repeat(2000) }).success).toBe(true);
  });
});

describe("meetingSchema", () => {
  it("acepta el formulario vacío salvo el título", () => {
    expect(errorsOf(meetingSchema.safeParse(emptyMeeting))).toEqual({ title: "El título es obligatorio." });
  });

  it("valida la imagen y la fecha", () => {
    const base = { ...emptyMeeting, title: "Taller" };
    expect(errorsOf(meetingSchema.safeParse({ ...base, image: file("image/gif", 10) }))).toEqual({
      image: "Formato no permitido. Usa JPG, PNG o WebP.",
    });
    expect(errorsOf(meetingSchema.safeParse({ ...base, image: file("image/png", 2 * 1024 * 1024 + 1) }))).toEqual({
      image: "La imagen supera los 2 MB.",
    });
    expect(meetingSchema.safeParse({ ...base, image: file("image/webp", 10) }).success).toBe(true);
    expect(errorsOf(meetingSchema.safeParse({ ...base, meetingDate: "mañana" }))).toEqual({
      meetingDate: "La fecha no es válida.",
    });
  });

  it("convierte la fecha entre el input local y la base de datos", () => {
    expect(fromDateTimeInput("")).toBeNull();
    const iso = fromDateTimeInput("2026-10-21T15:30");
    expect(iso).not.toBeNull();
    expect(toDateTimeInput(iso)).toBe("2026-10-21T15:30");
    expect(toDateTimeInput(null)).toBe("");
  });
});

describe("testimonialSchema", () => {
  it("pide nombre y testimonio", () => {
    expect(errorsOf(testimonialSchema.safeParse(emptyTestimonial))).toEqual({
      name: "El nombre es obligatorio.",
      content: "El testimonio es obligatorio.",
    });
  });
});

describe("sectionSchema", () => {
  it("pide título y descripción, y limita el largo", () => {
    expect(
      errorsOf(sectionSchema.safeParse({ title: "", subtitle: "", description: "", highlight: "" })),
    ).toEqual({ title: "El título es obligatorio.", description: "La descripción es obligatoria." });
    expect(
      errorsOf(sectionSchema.safeParse({ title: "x".repeat(201), subtitle: "", description: "x", highlight: "" })),
    ).toEqual({ title: "Máximo 200 caracteres." });
  });
});
