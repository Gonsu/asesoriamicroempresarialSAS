import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState, FieldError, ListSkeleton } from "@/components/QueryState";
import { useToast } from "@/hooks/use-toast";
import { SECTION_KEYS, SECTION_LABELS, type SectionContent, type SectionKey } from "../defaults";
import { useSaveSection, useSiteContent } from "../hooks";
import { sectionSchema, type SectionFormValues } from "../schema";

const ContentEditor = () => {
  const { data, isPending, isError, error, refetch } = useSiteContent();

  if (isPending) return <ListSkeleton rows={3} />;
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Si dejas vacío el subtítulo, el sitio muestra el original. Separa los párrafos con una línea en blanco.
      </p>
      {SECTION_KEYS.map((key) => (
        <SectionForm key={key} sectionKey={key} initial={data[key]} />
      ))}
    </div>
  );
};

const SectionForm = ({ sectionKey, initial }: { sectionKey: SectionKey; initial: SectionContent }) => {
  const { toast } = useToast();
  const save = useSaveSection();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SectionFormValues>({ resolver: zodResolver(sectionSchema), defaultValues: initial });
  const label = SECTION_LABELS[sectionKey];
  const id = (field: string) => `${sectionKey}-${field}`;

  const onSubmit = async (values: SectionFormValues) => {
    try {
      await save.mutateAsync({ key: sectionKey, values });
      reset(values);
      toast({ title: "Guardado", description: `Sección "${label}" actualizada.` });
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-xl p-6" noValidate>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-foreground">{label}</h3>
        {isDirty && (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => reset()}>
              <RotateCcw size={14} className="mr-1" /> Descartar
            </Button>
            <Button type="submit" size="sm" disabled={save.isPending}>
              <Save size={14} className="mr-1" /> {save.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={id("title")}>Título</Label>
          <Input
            id={id("title")}
            aria-invalid={!!errors.title}
            aria-describedby={id("title-error")}
            {...register("title")}
          />
          <FieldError id={id("title-error")} message={errors.title?.message} />
        </div>
        <div>
          <Label htmlFor={id("subtitle")}>Subtítulo</Label>
          <Input
            id={id("subtitle")}
            aria-invalid={!!errors.subtitle}
            aria-describedby={id("subtitle-error")}
            {...register("subtitle")}
          />
          <FieldError id={id("subtitle-error")} message={errors.subtitle?.message} />
        </div>
        {sectionKey === "hero" && (
          <div className="md:col-span-2">
            <Label htmlFor={id("highlight")}>Palabra resaltada del título</Label>
            <Input
              id={id("highlight")}
              aria-invalid={!!errors.highlight}
              aria-describedby={`${id("highlight-hint")} ${id("highlight-error")}`}
              {...register("highlight")}
            />
            <p id={id("highlight-hint")} className="text-xs text-muted-foreground mt-1">
              Debe aparecer tal cual en el título; si no aparece, no se resalta nada.
            </p>
            <FieldError id={id("highlight-error")} message={errors.highlight?.message} />
          </div>
        )}
      </div>
      <div className="mt-4">
        <Label htmlFor={id("description")}>Descripción</Label>
        <Textarea
          id={id("description")}
          rows={3}
          aria-invalid={!!errors.description}
          aria-describedby={id("description-error")}
          {...register("description")}
        />
        <FieldError id={id("description-error")} message={errors.description?.message} />
      </div>
    </form>
  );
};

export default ContentEditor;
