import { z } from "@/lib/zod";

// Sin límites de longitud en la tabla site_content; estos evitan textos desproporcionados.
export const sectionSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio.").max(200, "Máximo 200 caracteres."),
  subtitle: z.string().trim().max(200, "Máximo 200 caracteres."),
  description: z.string().trim().min(1, "La descripción es obligatoria.").max(2000, "Máximo 2000 caracteres."),
  highlight: z.string().trim().max(60, "Máximo 60 caracteres."),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;
