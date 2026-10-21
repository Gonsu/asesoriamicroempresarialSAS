import { z } from "@/lib/zod";

// Mismos límites que los CHECK de public.contact_messages y la Edge Function `contact`.
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre.").max(120, "Máximo 120 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "Escribe tu correo.")
    .max(254, "Máximo 254 caracteres.")
    .pipe(z.email("El correo no es válido.")),
  message: z
    .string()
    .trim()
    .min(10, "El mensaje debe tener al menos 10 caracteres.")
    .max(2000, "Máximo 2000 caracteres."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
