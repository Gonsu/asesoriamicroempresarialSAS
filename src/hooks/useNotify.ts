import { useToast } from "@/hooks/use-toast";
import type { MutationResult } from "@/lib/mutationResult";

/** Toasts de las operaciones del panel. Si la operación dejó un aviso, se muestra en lugar del éxito. */
export function useNotify() {
  const { toast } = useToast();
  return {
    success: (title: string, result?: MutationResult) =>
      toast(
        result?.warning
          ? { title: `${title} con aviso`, description: result.warning, variant: "destructive" }
          : { title, description: "Operación exitosa." },
      ),
    error: (err: unknown) =>
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Ocurrió un error inesperado.",
        variant: "destructive",
      }),
  };
}
