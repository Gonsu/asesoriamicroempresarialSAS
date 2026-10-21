import { z } from "zod";
import { optionalImageSchema } from "@/lib/imageField";

// Mismos límites que los CHECK de la tabla meetings.
export const meetingSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio.").max(200, "Máximo 200 caracteres."),
  description: z.string().trim().max(5000, "Máximo 5000 caracteres."),
  meetingDate: z.string().refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "La fecha no es válida."),
  type: z.enum(["reunion", "asesoria"], { error: "Elige un tipo." }),
  published: z.boolean(),
  image: optionalImageSchema,
});

export type MeetingFormValues = z.infer<typeof meetingSchema>;

export const emptyMeeting: MeetingFormValues = {
  title: "",
  description: "",
  meetingDate: "",
  type: "reunion",
  published: false,
  image: null,
};

/** ISO de la base de datos → valor de <input type="datetime-local"> en hora local. */
export function toDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Valor de <input type="datetime-local"> (hora local) → ISO con zona horaria, o null. */
export function fromDateTimeInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
