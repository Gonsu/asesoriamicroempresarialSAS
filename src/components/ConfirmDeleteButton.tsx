import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  /** Nombre de lo que se borra, para el mensaje ("el testimonio de Ana"). */
  itemLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
}

/** Botón de borrar que pide confirmación antes de llamar a onConfirm. */
const ConfirmDeleteButton = ({ itemLabel, onConfirm, disabled }: Props) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
        disabled={disabled}
        aria-label={`Eliminar ${itemLabel}`}
        title="Eliminar"
      >
        <Trash2 size={14} />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Eliminar {itemLabel}?</AlertDialogTitle>
        <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel asChild>
          <Button variant="outline">Cancelar</Button>
        </AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button variant="destructive" onClick={onConfirm}>
            Eliminar
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ConfirmDeleteButton;
