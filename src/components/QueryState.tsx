import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Error al cargar datos, con botón para reintentar. */
export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div role="alert" className="text-center py-12 text-muted-foreground">
    <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-destructive/70" />
    <p className="text-sm">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        Reintentar
      </Button>
    )}
  </div>
);

/** Lista sin elementos. */
export const EmptyState = ({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) => (
  <div className="text-center py-16 text-muted-foreground">
    <Icon className="w-12 h-12 mx-auto mb-3 opacity-40" />
    <p>{title}</p>
    {hint && <p className="text-sm">{hint}</p>}
  </div>
);

/** Filas de carga para las listas del panel. */
export const ListSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3" aria-busy="true" aria-label="Cargando">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start">
        <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    ))}
  </div>
);

/** Mensaje de validación de un campo; el id se enlaza con aria-describedby. */
export const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} className="text-xs text-destructive mt-1">
      {message}
    </p>
  ) : null;
