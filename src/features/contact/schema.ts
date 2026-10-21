import { z } from "zod";

// El mensaje viaja en un enlace mailto:, así que se limita para no superar el largo
// que aceptan los clientes de correo.
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre.").max(120, "Máximo 120 caracteres."),
  email: z.string().trim().min(1, "Escribe tu correo.").pipe(z.email("El correo no es válido.")),
  message: z
    .string()
    .trim()
    .min(10, "El mensaje debe tener al menos 10 caracteres.")
    .max(1500, "Máximo 1500 caracteres."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

/** Arma el enlace mailto: con el asunto y el cuerpo del mensaje. */
export function contactMailto(mailtoUrl: string, values: ContactFormValues): string {
  const subject = encodeURIComponent(`Contacto desde la web — ${values.name}`);
  const body = encodeURIComponent(`Nombre: ${values.name}\nCorreo: ${values.email}\n\nMensaje:\n${values.message}`);
  return `${mailtoUrl}?subject=${subject}&body=${body}`;
}
