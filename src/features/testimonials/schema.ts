import { z } from "zod";
import { optionalImageSchema } from "@/lib/imageField";

// Mismos límites que los CHECK de la tabla testimonials.
export const testimonialSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio.").max(120, "Máximo 120 caracteres."),
  businessType: z.string().trim().max(120, "Máximo 120 caracteres."),
  content: z.string().trim().min(1, "El testimonio es obligatorio.").max(2000, "Máximo 2000 caracteres."),
  isPublished: z.boolean(),
  image: optionalImageSchema,
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export const emptyTestimonial: TestimonialFormValues = {
  name: "",
  businessType: "",
  content: "",
  isPublished: false,
  image: null,
};
