import { z } from "@/lib/zod";
import { validateImage } from "@/lib/storageImage";

/** Campo de imagen opcional de los formularios del panel: valida formato y tamaño al elegirla. */
export const optionalImageSchema = z.custom<File | null>((value) => value === null || value instanceof File).superRefine(
  (file, ctx) => {
    const message = file && validateImage(file);
    if (message) ctx.addIssue({ code: "custom", message });
  },
);
